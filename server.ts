import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending emails
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const receiver = process.env.RECEIVER_EMAIL || "jinghanw312@gmail.com";

    if (!user || !pass) {
      console.error("Missing SMTP credentials");
      return res.status(500).json({ 
        error: "尚未設定郵件發送帳號。請在 Settings -> Secrets 中設定 SMTP_USER 與 SMTP_PASS。" 
      });
    }

    // Standard Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    const mailOptions = {
      from: user,
      to: receiver,
      subject: `[NEO-GYM 官網諮詢] ${subject} - ${name}`,
      text: `
        您收到一則新的聯絡表單訊息：
        
        姓名：${name}
        電話：${phone}
        電子郵件：${email}
        諮詢主題：${subject}
        
        訊息內容：
        ${message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #06b6d4;">NEO-GYM 官網新訊息</h2>
          <p><strong>姓名：</strong> ${name}</p>
          <p><strong>電話：</strong> ${phone}</p>
          <p><strong>電子郵件：</strong> ${email}</p>
          <p><strong>主題：</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>訊息內容：</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ error: "郵件發送失敗，請稍後再試。" });
    }
  });

  // API Route for Google Sheets submission
  app.post("/api/sheet-submit", async (req, res) => {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn("GOOGLE_SHEET_WEBHOOK_URL is not configured.");
      console.log("Form Data received (No Webhook):", req.body);
      return res.json({ success: true, warning: "Webhook URL not configured" });
    }

    try {
      console.log(`Submitting to Google Sheet Webhook: ${webhookUrl}`);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...req.body,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Apps Script Error Status: ${response.status}`);
        console.error(`Google Apps Script Error Body: ${errorText}`);
        throw new Error(`Google Apps Script returned ${response.status}: ${errorText.substring(0, 100)}`);
      }

      console.log("Successfully submitted to Google Sheets");
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to submit to Google Sheets:", error);
      res.status(500).json({ error: "資料存入試算表失敗，請聯繫管理員確認 Webhook 設定。" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
