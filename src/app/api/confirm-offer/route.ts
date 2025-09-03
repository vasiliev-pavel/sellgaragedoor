import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
// ИЗМЕНЕНО: Импортируем основной тип для опций письма
import type { MailOptions } from "nodemailer";

// Убедитесь, что эти переменные окружения заданы в Vercel
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Интерфейсы данных, которые мы ожидаем от фронтенда
interface UserInfo {
  phone: string;
  email: string;
  doors: string;
  material: string;
}

interface SelectedDoor {
  id: string;
  name: string;
  material: string;
  rValue?: number;
  basePrice: number;
  installPrice: number;
  imageLabel: string;
  description: string;
}

interface EmailData {
  userInfo: UserInfo;
  selectedDoor: SelectedDoor;
  tradeInCredit: number;
  generatedImage?: string; // base64
}

// Настройка Nodemailer
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("SMTP environment variables are not set!");
    throw new Error("SMTP configuration is missing");
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465, // true для порта 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// HTML шаблон для email пользователю (без изменений)
const createUserEmailTemplate = (data: EmailData) => {
  const { userInfo, selectedDoor, tradeInCredit } = data;
  const totalBeforeTradeIn = selectedDoor.basePrice + selectedDoor.installPrice;
  const finalPrice = totalBeforeTradeIn - tradeInCredit;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Your Garage Door Offer - Illinois Garage Door Repair</title><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; } .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); } .header { background-color: #0E4A7B; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; } .content { padding: 30px 20px; } .door-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #E86A2F; } .price-final { font-size: 24px; font-weight: bold; color: #28a745; } .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; } .button { display: inline-block; background-color: #E86A2F; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; } img { max-width: 100%; height: auto; border-radius: 8px; }</style></head><body><div class="container"><div class="header"><h1>Your Offer is Confirmed!</h1></div><div class="content"><h2>Hello, thank you for choosing Illinois Garage Door Repair!</h2><p>We've received your selection and locked in your price. A copy of your offer is detailed below. Our team will contact you shortly at <strong>${
    userInfo.phone
  }</strong> to schedule a free, no-obligation measurement.</p><div class="door-info"><h3>Your Selected Door: ${
    selectedDoor.name
  }</h3><p><strong>Total (Door + Install):</strong> $${totalBeforeTradeIn}</p><p style="color: #E86A2F;"><strong>Your Instant Trade-in Credit:</strong> -$${tradeInCredit}</p><hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;"><p><strong>Final Price:</strong> <span class="price-final">$${finalPrice}</span></p></div>${
    data.generatedImage
      ? `<div style="text-align:center; margin-bottom:20px;"><p><strong>Your AI-Generated Preview:</strong></p><img src="cid:generated-doors-image" alt="Generated door options"/></div>`
      : ""
  }<p><strong>Next Steps:</strong></p><ol><li>Expect a call from our manager within 24 hours.</li><li>We'll schedule a quick, free in-home measurement.</li><li>You'll get a final quote with your credit applied.</li><li>We install your beautiful new door!</li></ol><div style="text-align: center; margin: 30px 0;"><p>Have questions? Call us anytime!</p><a href="tel:+18472500221" class="button">Call (847) 250-0221</a></div></div><div class="footer">&copy; ${new Date().getFullYear()} Illinois Garage Door Repair. All rights reserved.</div></div></body></html>`;
};

// HTML шаблон для email администратору (без изменений)
const createAdminEmailTemplate = (data: EmailData) => {
  const { userInfo, selectedDoor, tradeInCredit } = data;
  const totalBeforeTradeIn = selectedDoor.basePrice + selectedDoor.installPrice;
  const finalPrice = totalBeforeTradeIn - tradeInCredit;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>🔔 New Confirmed Offer - ${
    userInfo.phone
  }</title><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; } .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); } .header { background-color: #E86A2F; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; } .content { padding: 30px 20px; } .info-block { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0E4A7B; } .price-final { font-size: 24px; font-weight: bold; color: #28a745; } .button { display: inline-block; background-color: #0E4A7B; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; } img { max-width: 100%; height: auto; border-radius: 8px; }</style></head><body><div class="container"><div class="header"><h1>🔔 New Confirmed Offer!</h1></div><div class="content"><h2>Action Required: A customer has confirmed their interest.</h2><p>Please contact them within 24 hours to schedule the free measurement.</p><div class="info-block"><h3>Customer Details</h3><p><strong>Phone:</strong> <a href="tel:${
    userInfo.phone
  }">${userInfo.phone}</a></p><p><strong>Email:</strong> <a href="mailto:${
    userInfo.email
  }">${userInfo.email}</a></p><p><strong>Original Doors:</strong> ${
    userInfo.doors
  } door(s), ${
    userInfo.material
  }</p></div><div class="info-block" style="border-left-color: #E86A2F;"><h3>Selected Door: ${
    selectedDoor.name
  }</h3><p><strong>Total (Door + Install):</strong> $${totalBeforeTradeIn}</p><p><strong>Trade-in Credit:</strong> -$${tradeInCredit}</p><p><strong>Final Quoted Price:</strong> <span class="price-final">$${finalPrice}</span></p></div>${
    data.generatedImage
      ? `<div style="text-align:center; margin-bottom:20px;"><p><strong>AI-Generated Preview:</strong></p><img src="cid:generated-doors-image" alt="Generated door options"/></div>`
      : ""
  }<div style="text-align: center; margin: 30px 0;"><a href="tel:${
    userInfo.phone
  }" class="button">📞 Call Customer Now</a></div></div><div class="footer">This is an automated notification from the website.</div></div></body></html>`;
};

export async function POST(request: NextRequest) {
  if (!ADMIN_EMAIL || !SMTP_USER) {
    console.error(
      "ADMIN_EMAIL or SMTP_USER is not set in environment variables!"
    );
    return NextResponse.json(
      { error: "Server configuration error. Please contact support." },
      { status: 500 }
    );
  }

  try {
    const data: EmailData = await request.json();

    if (
      !data.userInfo ||
      !data.selectedDoor ||
      data.tradeInCredit === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required data from the request." },
        { status: 400 }
      );
    }

    const transporter = createTransporter();

    const attachments = [];
    if (data.generatedImage) {
      // ИСПРАВЛЕНИЕ: Преобразуем base64 строку в Buffer.
      // Сначала удаляем префикс данных, если он есть (например, 'data:image/png;base64,')
      const base64Data = data.generatedImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

      attachments.push({
        filename: "generated-doors.png",
        // TypeScript теперь будет доволен, так как content является Buffer
        content: Buffer.from(base64Data, "base64"),
        cid: "generated-doors-image",
        // Свойство 'encoding' больше не нужно, так как мы передаем Buffer
      });
    }

    const userEmailHtml = createUserEmailTemplate(data);
    const userMailOptions: MailOptions = {
      from: `"Illinois Garage Door Repair" <${SMTP_USER}>`,
      to: data.userInfo.email,
      subject: "✅ Your Garage Door Offer is Confirmed!",
      html: userEmailHtml,
      attachments: attachments,
    };

    const adminEmailHtml = createAdminEmailTemplate(data);
    const adminMailOptions: MailOptions = {
      from: `"Website Lead" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 New Confirmed Offer from ${data.userInfo.phone}`,
      html: adminEmailHtml,
      attachments: attachments,
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error: unknown) {
    console.error("Error in /api/confirm-offer:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to send emails", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
