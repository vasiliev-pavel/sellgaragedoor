import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@garagedoor.com";

interface UserInfo {
  name?: string;
  phone: string;
  email: string;
  doors: string;
  garageType: string;
  material?: string;
}

interface SelectedDoor {
  id: string;
  name: string;
  material: string;
  rValue?: number;
  msrp: number;
  install: number;
  imageLabel: string;
}

interface EmailData {
  userInfo: UserInfo;
  selectedDoor: SelectedDoor;
  originalImage?: string;
  generatedImage?: string;
}

// Настройка транспорта для отправки email
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is missing");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// HTML шаблон для email пользователю
const createUserEmailTemplate = (
  data: EmailData,
  hasAttachments: boolean = false
) => {
  const selectedDoor = data.selectedDoor;
  const userInfo = data.userInfo;
  const originalImage = data.originalImage;
  const generatedImage = data.generatedImage;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Garage Door Selection - Illinois Garage Door Repair</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0E4A7B; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .door-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E86A2F; }
        .contact-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0E4A7B; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .button { display: inline-block; background: #E86A2F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .image-container { text-align: center; margin: 20px 0; }
        .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Illinois Garage Door Repair</h1>
          <p>Your Door Selection Confirmed</p>
        </div>

        <div class="content">
          <h2>Thank you for choosing us!</h2>
          <p>We've received your garage door selection. Our team will contact you shortly to schedule a free in-home measurement.</p>

          <div class="door-info">
            <h3>Your Selected Door</h3>
            <p><strong>Door Style:</strong> ${selectedDoor.name}</p>
            <p><strong>Material:</strong> ${selectedDoor.material}</p>
            <p><strong>MSRP:</strong> $${selectedDoor.msrp}</p>
            <p><strong>Installation:</strong> $${selectedDoor.install}</p>
            <p><strong>Total (before trade-in):</strong> $${
              selectedDoor.msrp + selectedDoor.install
            }</p>
            ${
              selectedDoor.rValue
                ? `<p><strong>R-Value:</strong> ${selectedDoor.rValue}</p>`
                : ""
            }
          </div>

          <div class="contact-info">
            <h3>Your Contact Information</h3>
            <p><strong>Phone:</strong> ${userInfo.phone}</p>
            <p><strong>Email:</strong> ${userInfo.email}</p>
            <p><strong>Number of Doors:</strong> ${userInfo.doors}</p>
            <p><strong>Garage Type:</strong> ${
              userInfo.garageType === "1-car" ? "Single Car" : "Double Car"
            }</p>
          </div>

          ${
            originalImage && hasAttachments
              ? `
          <div class="image-container">
            <h3>Your Original Garage</h3>
            <img src="cid:original-garage-image" alt="Original garage" />
          </div>
          `
              : ""
          }

          ${
            generatedImage && hasAttachments
              ? `
          <div class="image-container">
            <h3>Your Door Options</h3>
            <img src="cid:generated-doors-image" alt="Generated door options" />
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+18472500221" class="button">Call Us: (847) 250-0221</a>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Our manager will contact you within 24 hours</li>
            <li>Free in-home measurement and final quote</li>
            <li>Schedule installation at your convenience</li>
            <li>Professional installation with warranty</li>
          </ol>

          <p>If you have any questions, please don't hesitate to contact us at (847) 250-0221.</p>
        </div>

        <div class="footer">
          <p>&copy; 2024 Illinois Garage Door Repair. All rights reserved.</p>
          <p>24/7 Emergency Service • Licensed & Insured</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// HTML шаблон для email администратору
const createAdminEmailTemplate = (
  data: EmailData,
  hasAttachments: boolean = false
) => {
  const selectedDoor = data.selectedDoor;
  const userInfo = data.userInfo;
  const originalImage = data.originalImage;
  const generatedImage = data.generatedImage;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Door Selection - Admin Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #E86A2F; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .customer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0E4A7B; }
        .door-selection { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E86A2F; }
        .action-required { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .button { display: inline-block; background: #0E4A7B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .image-container { text-align: center; margin: 20px 0; }
        .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Door Selection</h1>
          <p>Admin Notification</p>
        </div>

        <div class="content">
          <div class="action-required">
            <h3>🚨 Action Required</h3>
            <p>A customer has selected a garage door. Please contact them within 24 hours to schedule a free measurement.</p>
          </div>

          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${userInfo.name || "Not provided"}</p>
            <p><strong>Phone:</strong> <a href="tel:${userInfo.phone}">${
    userInfo.phone
  }</a></p>
            <p><strong>Email:</strong> <a href="mailto:${userInfo.email}">${
    userInfo.email
  }</a></p>
            <p><strong>Number of Doors:</strong> ${userInfo.doors}</p>
            <p><strong>Garage Type:</strong> ${
              userInfo.garageType === "1-car" ? "Single Car" : "Double Car"
            }</p>
            <p><strong>Material of Current Door:</strong> ${
              userInfo.material || "Not specified"
            }</p>
          </div>

          <div class="door-selection">
            <h3>Selected Door</h3>
            <p><strong>Door Style:</strong> ${selectedDoor.name}</p>
            <p><strong>Material:</strong> ${selectedDoor.material}</p>
            <p><strong>MSRP:</strong> $${selectedDoor.msrp}</p>
            <p><strong>Installation:</strong> $${selectedDoor.install}</p>
            <p><strong>Total (before trade-in):</strong> $${
              selectedDoor.msrp + selectedDoor.install
            }</p>
            ${
              selectedDoor.rValue
                ? `<p><strong>R-Value:</strong> ${selectedDoor.rValue}</p>`
                : ""
            }
          </div>

          ${
            originalImage && hasAttachments
              ? `
          <div class="image-container">
            <h3>Original Garage Photo</h3>
            <img src="cid:original-garage-image" alt="Original garage" />
          </div>
          `
              : ""
          }

          ${
            generatedImage && hasAttachments
              ? `
          <div class="image-container">
            <h3>Generated Door Options</h3>
            <img src="cid:generated-doors-image" alt="Generated door options" />
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:${userInfo.phone}" class="button">📞 Call Customer</a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>Follow-up Checklist:</h4>
            <ul>
              <li>✅ Contact customer within 24 hours</li>
              <li>📅 Schedule free in-home measurement</li>
              <li>💰 Provide final quote with trade-in credit</li>
              <li>📝 Confirm installation date</li>
              <li>🔧 Coordinate with installation team</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2024 Illinois Garage Door Repair - Admin System</p>
          <p>This is an automated notification from the website.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const data: EmailData = await request.json();

    if (!data.userInfo || !data.selectedDoor) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Создаем транспортер
    const transporter = createTransporter();

    // Проверяем подключение
    try {
      await transporter.verify();
    } catch (error) {
      console.error("SMTP connection failed:", error);
      return NextResponse.json(
        { error: "Email service configuration error" },
        { status: 500 }
      );
    }

    // Подготавливаем attachments для изображений
    const attachments = [];

    if (data.originalImage) {
      attachments.push({
        filename: "original-garage.jpg",
        content: Buffer.from(data.originalImage, "base64"),
        cid: "original-garage-image",
      });
    }

    if (data.generatedImage) {
      attachments.push({
        filename: "generated-doors.png",
        content: Buffer.from(data.generatedImage, "base64"),
        cid: "generated-doors-image",
      });
    }

    // Отправляем email пользователю
    const userEmailHtml = createUserEmailTemplate(data, attachments.length > 0);
    const userMailOptions = {
      from: `"Illinois Garage Door Repair" <${SMTP_USER}>`,
      to: data.userInfo.email,
      subject: "Your Garage Door Selection - Illinois Garage Door Repair",
      html: userEmailHtml,
      attachments: attachments,
    };

    // Отправляем email администратору
    const adminEmailHtml = createAdminEmailTemplate(
      data,
      attachments.length > 0
    );
    const adminMailOptions = {
      from: `"Illinois Garage Door Repair" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: "New Door Selection - Customer Notification Required",
      html: adminEmailHtml,
      attachments: attachments,
    };

    // Отправляем оба email
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(
      `Emails sent successfully to ${data.userInfo.email} and ${ADMIN_EMAIL}`
    );

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
