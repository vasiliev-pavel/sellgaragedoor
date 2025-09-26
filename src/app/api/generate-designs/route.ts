import { NextRequest, NextResponse } from "next/server";
// ПРИМЕЧАНИЕ: Я предполагаю, что вы используете официальный пакет `@google/generative-ai`.
// Если это так, он предоставляет свои типы, что еще лучше. Здесь я создам кастомные типы для ясности.
// import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { promises as fs } from "node:fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const DESIGN_DIR = path.join(process.cwd(), "public", "designs");

async function fileToBase64(absPath: string) {
  const buf = await fs.readFile(absPath);
  return buf.toString("base64");
}

function guessMime(p: string) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

// --- ИСПРАВЛЕНИЕ 1: Определяем конкретные типы для частей запроса ---
// Тип для части с изображением
type ImagePart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

// Тип для части с текстом
type TextPart = {
  text: string;
};

// Объединяем их в один тип для содержимого запроса
type ContentPart = TextPart | ImagePart;

// Тип для части ответа, который мы ожидаем
type GeneratedPart = {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
};


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image") as File | null;
    const phone = (formData.get("phone") as string) || "";
    const email = (formData.get("email") as string) || "";
    const doors = (formData.get("doors") as string) || "1";
    const garageType = (formData.get("garageType") as string) || "1-car";
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

    const userBytes = Buffer.from(await imageFile.arrayBuffer());
    const userBase64 = userBytes.toString("base64");
    
    // Используем тип ImagePart[] для большей строгости
    const designInlineParts: ImagePart[] = [];
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

    // @ts-ignore
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const isMultiDoor = doors === "2" || doors === "3" || garageType === "2-car";

    const promptText = [
      `TASK: Inpaint ONLY the garage door panels on the user's photo using the reference design(s).`,
      // ... (остальной текст промпта без изменений)
      "5) Output a single edited image.",
    ].join("\n");

    // --- ИСПРАВЛЕНИЕ 1 (Применение): Заменяем any[] на ContentPart[] ---
    // Это ошибка на строке 101
    const contents: ContentPart[] = [
      { text: promptText },
      {
        inlineData: {
          mimeType: imageFile.type || "image/jpeg",
          data: userBase64,
        },
      },
      ...designInlineParts.slice(0, 3),
    ];
    // @ts-ignore
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Используйте актуальную модель
      contents,
    });

    let generatedImageBase64 = "";
    if (response?.candidates?.[0]?.content?.parts) {
      // --- ИСПРАВЛЕНИЕ 2: Заменяем `as any[]` на `as GeneratedPart[]` ---
      // Это ошибка на строке 123
      for (const part of response.candidates[0].content.parts as GeneratedPart[]) {
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
    // Укажем тип для ошибки, чтобы избежать неявного `any`
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("generate-designs error:", err);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}