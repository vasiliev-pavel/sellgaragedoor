import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image") as File;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const doors = (formData.get("doors") as string) || "1";
    const garageType = (formData.get("garageType") as string) || "1-car";

    if (!imageFile) {
      return NextResponse.json({ error: "Image not found" }, { status: 400 });
    }

    // to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // === UPDATED PROMPT ===
    const isMultiDoor =
      doors === "2" || doors === "3" || garageType === "2-car";

    const prompt = `
You are a photo editor. Use the CLIENT'S UPLOADED PHOTO as the BASE LAYER.
Do NOT generate a new scene. Do NOT crop. Keep the original house, driveway,
siding, trim, roof, landscaping, and camera perspective exactly as in the input.

Task:
1) Replace ONLY the garage door surface(s) in the input photo with four different door designs.
2) Produce ONE single image as a 2×2 collage (top-left, top-right, bottom-left, bottom-right).
3) Each quadrant shows the client’s own house with a different door design composited in.
4) If the property has ${isMultiDoor ? "multiple" : "a single"} garage door${
      isMultiDoor ? "s" : ""
    }, apply each design to ${
      isMultiDoor ? "all visible doors" : "the visible door"
    } in the photo for that quadrant.
5) Preserve perspective, scale, jambs, trim, and tracks; align panels and windows to the opening;
   match lighting, shadows, reflections, and color temperature to the original photo.
6) Do not alter anything except the garage door leaf and its glass/hardware (where specified).
7) Output a single composite image only (no captions or extra borders).
   Keep the same aspect ratio as the input and add thin, subtle internal gutters between quadrants.
   Optional tiny corner labels "A", "B", "C", "D" are OK.

Door styles (in the order and placement specified below):
A (top-left): Standard short raised panels, white color, with a top-row of windows.
B (top-right): Standard flat/flush look with wood-tone finish (e.g., medium walnut), with a top-row of windows.
C (bottom-left): Stamped carriage house style, with classic carriage windows and tasteful decorative hardware.
D (bottom-right): Modern sleek contemporary style (flush panels); if appropriate, narrow glass lites in a balanced layout.

General rules:
- Keep trim color and surrounding materials unchanged.
- Do not add cars, people, logos, or watermarks.
- Use the highest available resolution from the input image.
- Return the result as a single raster image (PNG/JPEG) that clearly shows the client’s own home with the four options.
`;

    const promptContent = [
      { text: prompt },
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: promptContent,
      // Если SDK поддерживает, можно добавить хинты:
      // generationConfig: { responseMimeType: "image/png" }
    });

    let generatedImageBase64 = "";

    if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    const result = {
      originalImage: base64Image,
      generatedImage: generatedImageBase64,
      userInfo: { phone, email, doors, garageType },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-designs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
