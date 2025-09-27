import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Типы данных, которые мы ожидаем от клиента
type DoorDesign = {
  id: string;
  name: string;
  imageUrl: string;
};

type DoorColor = {
  name:string;
  hex: string;
};

// --- ОСНОВНАЯ ФУНКЦИЯ ОБРАБОТКИ POST-ЗАПРОСА ---

export async function POST(req: NextRequest) {
  // 1. Проверяем наличие API ключа
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // 2. Извлекаем FormData из запроса
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    
    // JSON данные приходят в виде строк, их нужно парсить
    const newDoorDesignStr = formData.get("newDoorDesign") as string | null;
    const newDoorColorStr = formData.get("newDoorColor") as string | null;

    if (!imageFile || !newDoorDesignStr || !newDoorColorStr) {
      return NextResponse.json(
        { success: false, error: "Missing required form data." },
        { status: 400 }
      );
    }
    
    const newDoorDesign: DoorDesign = JSON.parse(newDoorDesignStr);
    const newDoorColor: DoorColor = JSON.parse(newDoorColorStr);

    // 3. Создаем промпт для AI на основе выбора пользователя
    // Это самая важная часть: мы даем четкую инструкцию модели
    const newDoorDescription = `${newDoorColor.name} ${newDoorDesign.name} style garage door`;
    const promptText = `Using the provided image, change only the garage door to a ${newDoorDescription}. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.`;

    // 4. Подготавливаем изображение для отправки в API
    // Конвертируем загруженный файл в base64
    const imageBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    const base64Image = buffer.toString("base64");

    const promptParts = [
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
      { text: promptText },
    ];
    
    // 5. Инициализируем AI клиент и отправляем запрос
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Используем модель, способную обрабатывать изображения. 
   
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    
    const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
    
    const response = result.response;
    
    // 6. Обрабатываем ответ от AI
    // Ищем в ответе сгенерированное изображение
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const generatedImageData = imagePart.inlineData.data;
      // Отправляем успешный ответ с base64 строкой нового изображения
      return NextResponse.json({
        success: true,
        imageData: generatedImageData,
      });
    } else {
      // Если модель не вернула изображение, сообщаем об ошибке
      console.error("AI response did not contain an image:", response.text());
      return NextResponse.json(
        { success: false, error: "Failed to generate image. The model did not return image data." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in generate-designs API:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}