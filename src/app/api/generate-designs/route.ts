import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Типы данных остаются без изменений
type DoorDesign = { id: string; name: string; imageUrl: string; };
type DoorColor = { name: string; hex: string; };

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    
    // --- ИЗМЕНЕНИЕ 1: ИЗВЛЕКАЕМ ОБА ИЗОБРАЖЕНИЯ ---
    const userImageFile = formData.get("image") as File | null; // Фото гаража
    const designImageFile = formData.get("designImage") as File | null; // Фото дизайна
    
    const newDoorDesignStr = formData.get("newDoorDesign") as string | null;
    const newDoorColorStr = formData.get("newDoorColor") as string | null;

    // Обновляем валидацию
    if (!userImageFile || !designImageFile || !newDoorDesignStr || !newDoorColorStr) {
      return NextResponse.json({ success: false, error: "Missing required form data." }, { status: 400 });
    }
    
    const newDoorDesign: DoorDesign = JSON.parse(newDoorDesignStr);
    const newDoorColor: DoorColor = JSON.parse(newDoorColorStr);

    // --- ИЗМЕНЕНИЕ 2: СОЗДАЕМ НОВЫЙ, БОЛЕЕ ТОЧНЫЙ ПРОМПТ ---
    const promptText = `Using the two provided images, perform a precise replacement. Take only the garage door from the second image (the door design reference) and place it onto the first image (the photo of the house), replacing the existing garage door. The new door's color should be '${newDoorColor.name}'. Ensure the final image perfectly preserves the house, perspective, lighting, and shadows from the original photo, seamlessly integrating the new door.`;

    // --- ИЗМЕНЕНИЕ 3: ГОТОВИМ ОБА ИЗОБРАЖЕНИЯ ДЛЯ API ---
    // Конвертируем фото пользователя
    const userImageBuffer = await userImageFile.arrayBuffer();
    const userBase64Image = Buffer.from(userImageBuffer).toString("base64");
    
    // Конвертируем фото дизайна
    const designImageBuffer = await designImageFile.arrayBuffer();
    const designBase64Image = Buffer.from(designImageBuffer).toString("base64");

    // Собираем промпт из ТРЕХ частей: два фото + текст
    const promptParts = [
      { inlineData: { mimeType: userImageFile.type, data: userBase64Image } },      // 1. Фото дома
      { inlineData: { mimeType: designImageFile.type, data: designBase64Image } }, // 2. Фото дизайна
      { text: promptText },                                                          // 3. Инструкция
    ];
    
    // Инициализация и вызов AI (без изменений)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Для мультимодальных задач лучше использовать gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
    const response = result.response;
    
    // Обработка ответа (без изменений)
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const generatedImageData = imagePart.inlineData.data;
      return NextResponse.json({ success: true, imageData: generatedImageData });
    } else {
      const errorText = response.candidates?.[0]?.finishReason || "Unknown reason";
      console.error("AI response did not contain an image. Reason:", errorText, response.text());
      return NextResponse.json({ success: false, error: `Failed to generate image. The model did not return image data. Reason: ${errorText}` }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in generate-designs API:", error);
    return NextResponse.json({ success: false, error: "An internal server error occurred." }, { status: 500 });
  }
}