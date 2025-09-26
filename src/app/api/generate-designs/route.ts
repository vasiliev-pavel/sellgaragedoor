import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { promises as fs } from "node:fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// где лежат исходные дизайны на сервере
const DESIGN_DIR = path.join(process.cwd(), "public", "designs");

// утилита: подгружаем файл и кодируем в base64
async function fileToBase64(absPath: string) {
  const buf = await fs.readFile(absPath);
  return buf.toString("base64");
}

// утилита: определяем mime по расширению (упрощённо)
function guessMime(p: string) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image") as File | null;
    const phone = (formData.get("phone") as string) || "";
    const email = (formData.get("email") as string) || "";
    const doors = (formData.get("doors") as string) || "1"; // "1" | "2" | "3"
    const garageType = (formData.get("garageType") as string) || "1-car";
    // можно передавать одно значение: designId="classic-oak"
    // или несколько: designId=classic-oak&designId=modern-black
    const designIdsRaw = formData.getAll("designId");
    const designIds = designIdsRaw
      .map((d) => String(d).trim())
      .filter(Boolean);

    if (!imageFile) {
      return NextResponse.json({ error: "Image not found" }, { status: 400 });
    }
    if (!designIds.length) {
      return NextResponse.json(
        { error: "Design ID(s) not provided" },
        { status: 400 }
      );
    }

    // клиентская картинка -> base64
    const userBytes = Buffer.from(await imageFile.arrayBuffer());
    const userBase64 = userBytes.toString("base64");

    // подгружаем эталонные дизайны с сервера
    // допустим, у вас файлы называются `${designId}.png` и лежат в /public/designs
    const designInlineParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    for (const id of designIds) {
      const abs = path.join(DESIGN_DIR, `${id}.png`);
      try {
        const b64 = await fileToBase64(abs);
        designInlineParts.push({
          inlineData: { mimeType: guessMime(abs), data: b64 },
        });
      } catch {
        return NextResponse.json(
          { error: `Design file not found for id="${id}"` },
          { status: 404 }
        );
      }
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const isMultiDoor = doors === "2" || doors === "3" || garageType === "2-car";

    // ===== СЕМАНТИЧЕСКАЯ ИНПЕЙНТ-ИНСТРУКЦИЯ (mask by text) =====
    // NB: Gemini лучше слушается чётких шагов, контекста и ограничений.
    const promptText = [
      `TASK: Inpaint ONLY the garage door panels on the user's photo using the reference design(s).`,
      `KEEP: house facade, walls, driveway, background, lighting, shadows, camera perspective, proportions.`,
      `EDIT SCOPE: strictly the garage door leaf/panels, including visible frames, windows (if present), hardware; do not move the camera.`,
      `PRESERVE: original environment, exposure, reflections on surrounding surfaces.`,
      `MATCH: overall color, material, panel layout, window cutouts, and trim from the provided design reference(s).`,
      `MULTI-DOOR: ${isMultiDoor ? "If there are multiple door sections, apply the same design consistently to each section, preserving spacing and seams." : "Single door: apply design consistently across the whole door."}`,
      `ALIGNMENT: respect perspective; align panel grid and windows to the user's door plane; keep the door size and opening unchanged.`,
      `LIGHTING: adapt design to existing scene lighting and shadows; avoid flat overlays.`,
      `QUALITY: photo-realistic result; no extra artifacts; no text; no watermarks; no extra props.`,
      `NEGATIVE: do not alter walls, cars, pavement, sky, plants, or any non-door objects.`,
      "",
      "Steps:",
      "1) Identify the garage door area (leaf/panels) in the user's image.",
      "2) From the reference design image(s), infer the material, color, paneling layout, window placement, and trim.",
      "3) Transfer only these door attributes onto the user's door, preserving geometry and perspective.",
      "4) Harmonize lighting and shadows; ensure realistic integration.",
      "5) Output a single edited image.",
    ].join("\n");

    // Содержимое запроса: сначала текст-инструкция, затем фото клиента, затем 1-3 эталонных дизайна
    const contents: any[] = [
      { text: promptText },
      {
        inlineData: {
          mimeType: imageFile.type || "image/jpeg",
          data: userBase64,
        },
      },
      // до 3 референсов — этого обычно достаточно
      ...designInlineParts.slice(0, 3),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents,
      // можно подсказать формат вывода
      // generationConfig: { responseMimeType: "image/png" },
    });

    // достаем первую картинку из ответа
    let generatedImageBase64 = "";
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts as any[]) {
        if (part?.inlineData?.data) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 502 }
      );
    }

    // возвращаем и исходник, и результат (base64)
    return NextResponse.json({
      userImage: userBase64,
      generatedImage: generatedImageBase64,
      meta: {
        phone,
        email,
        doors,
        garageType,
        designIds,
      },
    });
  } catch (err) {
    console.error("generate-designs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
