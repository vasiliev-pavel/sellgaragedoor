import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { MailOptions } from "nodemailer";

// Убедитесь, что эти переменные окружения заданы в Vercel
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Интерфейсы данных
interface UserInfo {
  phone: string;
  email: string;
  singleDoors: number;
  doubleDoors: number;
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
  originalImage?: string;
  selectedDesignImage?: string;
  generatedImage?: string;
}

// Nodemailer transporter
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("SMTP environment variables are not set!");
    throw new Error("SMTP configuration is missing");
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const createUserEmailTemplate = (data: EmailData) => {
  const { userInfo, selectedDoor, tradeInCredit } = data;
  const totalBeforeTradeIn = selectedDoor.basePrice + selectedDoor.installPrice;
  const finalPrice = totalBeforeTradeIn - tradeInCredit;

  // SVG иконки для шагов
  const icons = {
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    ruler: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L3 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Offer for the ${selectedDoor.name} Door is Confirmed!</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.07); border: 1px solid #e2e8f0; }
        .header { background-color: #0E4A7B; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .intro { font-size: 16px; color: #333; line-height: 1.6; }
        .offer-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .offer-box h3 { margin-top: 0; color: #0E4A7B; font-size: 18px; }
        .price-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; color: #334155; }
        .price-item span:first-child { color: #64748b; }
        .price-item.credit { color: #E86A2F; font-weight: 500; }
        .price-item.total { font-weight: bold; font-size: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 10px; color: #15803d; }
        .preview-title { text-align: center; color: #333; font-weight: bold; margin: 30px 0 15px 0; }
        .preview-image img { max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
        .next-steps { list-style: none; padding: 0; margin: 30px 0; }
        .next-steps li { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .next-steps .step-icon {
          color: #E86A2F;
          font-size: 24px;
          line-height: 1;
          font-weight: bold;
          flex-shrink: 0;
        }
        .button-wrapper { text-align: center; margin: 30px 0; }
        .button { background-color: #E86A2F; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Your Offer is Confirmed!</h1></div>
        <div class="content">
          <p class="intro">Hello, thank you for choosing Illinois Garage Door Repair!</p>
          <p>We've received your selection and locked in your price. Our team will contact you shortly at <strong>${
            userInfo.phone
          }</strong> to schedule a free, no-obligation measurement.</p>
          <div class="offer-box">
            <h3>Your Selected Door: ${selectedDoor.name}</h3>
            <div class="price-item"><span>Total (Door + Install)</span><span>$${totalBeforeTradeIn}</span></div>
            <div class="price-item credit"><span>Your Instant Trade-in Credit</span><span>-$${tradeInCredit}</span></div>
            <div class="price-item total"><span>Final Price</span><span>$${finalPrice}</span></div>
          </div>
          ${
            data.selectedDesignImage
              ? `<p class="preview-title">Your New Door Vision!</p><div class="preview-image"><img src="cid:selected-design-image" alt="Your new door preview"></div>`
              : ""
          }
           <h3>Next Steps:</h3>
          <ul class="next-steps">
            <li><span class="step-icon">•</span><div><strong> Expect a call</strong> from our manager within 24 hours.</div></li>
            <li><span class="step-icon">•</span><div><strong> Free measurement</strong> to confirm details and provide a final quote.</div></li>
            <li><span class="step-icon">•</span><div><strong> Schedule installation</strong> at a time that works for you.</div></li>
            <li><span class="step-icon">•</span><div><strong> Enjoy your beautiful new door!</strong> Our team will handle everything.</div></li>
          </ul>
          <div class="button-wrapper"><p style="margin-bottom: 10px;">Have questions? Call us anytime!</p><a href="tel:+18472500221" class="button">Call (847) 250-0221</a></div>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Illinois Garage Door Repair. All Rights Reserved.</div>
      </div>
    </body>
    </html>
  `;
};

// Шаблон для админа (с обновленным полем для информации о дверях)
const createAdminEmailTemplate = (data: EmailData) => {
  const { userInfo, selectedDoor, tradeInCredit } = data;
  const totalBeforeTradeIn = selectedDoor.basePrice + selectedDoor.installPrice;
  const finalPrice = totalBeforeTradeIn - tradeInCredit;
  const doorInfo = `Single Doors: ${userInfo.singleDoors}, Double Doors: ${userInfo.doubleDoors}, Material: ${userInfo.material}`;
  return `<!DOCTYPE html><html><head><title>🔔 New Confirmed Offer - ${
    userInfo.phone
  }</title></head><body><h1>New Offer</h1><p>Contact ${userInfo.phone} / ${
    userInfo.email
  }</p><div><p><strong>Original Doors:</strong> ${doorInfo}</p><h3>Selection: ${
    selectedDoor.name
  }</h3><p>Total: $${totalBeforeTradeIn}</p><p>Credit: -$${tradeInCredit}</p><p><strong>Final: $${finalPrice}</strong></p></div>${
    data.generatedImage
      ? `<p>Preview Collage:</p><img src="cid:generated-doors-image" alt="Generated options" style="max-width: 100%;"/>`
      : ""
  }</body></html>`;
};
export async function POST(request: NextRequest) {
  if (!ADMIN_EMAIL || !SMTP_USER) {
    console.error(
      "ADMIN_EMAIL or SMTP_USER is not set in environment variables!"
    );
    return NextResponse.json(
      { error: "Server configuration error." },
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

    const userAttachments = [];
    if (data.selectedDesignImage) {
      const base64Data = data.selectedDesignImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      userAttachments.push({
        filename: "your-new-door.png",
        content: Buffer.from(base64Data, "base64"),
        cid: "selected-design-image",
      });
    }

    const adminAttachments = [];
    if (data.generatedImage) {
      const base64Data = data.generatedImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      adminAttachments.push({
        filename: "design-collage.png",
        content: Buffer.from(base64Data, "base64"),
        cid: "generated-doors-image",
      });
    }

    const userEmailHtml = createUserEmailTemplate(data);
    const userMailOptions: MailOptions = {
      from: `"Illinois Garage Door Repair" <${SMTP_USER}>`,
      to: data.userInfo.email,
      subject: `✅ Your Offer for the ${data.selectedDoor.name} is Confirmed!`,
      html: userEmailHtml,
      attachments: userAttachments,
    };

    const adminEmailHtml = createAdminEmailTemplate(data);
    const adminMailOptions: MailOptions = {
      from: `"Website Lead" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 New Confirmed Offer from ${data.userInfo.phone}`,
      html: adminEmailHtml,
      attachments: adminAttachments,
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
