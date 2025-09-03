// Простой тест для отправки email
// Запустите: node test-email.js

const nodemailer = require("nodemailer");

async function testEmail() {
  // Настройки для тестирования (замените на свои)
  const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password",
    },
  });

  try {
    // Проверяем соединение
    await transporter.verify();
    console.log("✅ SMTP соединение успешно!");

    // Отправляем тестовый email
    const info = await transporter.sendMail({
      from: '"Test" <your-email@gmail.com>',
      to: "your-email@gmail.com",
      subject: "Test Email",
      html: "<h1>Test email with attachments</h1><p>This is a test email to verify SMTP settings.</p>",
      attachments: [
        {
          filename: "test.txt",
          content: Buffer.from("This is a test attachment"),
          cid: "test-attachment",
        },
      ],
    });

    console.log("✅ Email отправлен успешно!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

testEmail();
