const nodemailer = require('nodemailer');

const createTransport = async () => {

  // DEVELOPMENT MODE → use Ethereal test email
  if (process.env.NODE_ENV === 'development') {

    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

  }

  // PRODUCTION MODE → use real SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendInquiryNotification = async (lawyerEmail, lawyerName, clientName, message) => {

  const transporter = await createTransport();

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fff;padding:30px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#d4af37;font-size:24px;margin:0;">⚖️ NyayMargadarshak</h1>
        <p style="color:#888;margin-top:4px;">New Client Inquiry</p>
      </div>

      <p>Dear <strong style="color:#d4af37;">${lawyerName}</strong>,</p>

      <p>You have received a new inquiry from <strong>${clientName}</strong>.</p>

      <div style="background:#1a1a1a;border-left:4px solid #d4af37;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="color:#ccc;margin:0;">"${message}"</p>
      </div>

      <p>Please log in to your dashboard to respond to this inquiry.</p>

      <a href="http://localhost:5173/lawyer/dashboard"
        style="display:inline-block;background:#d4af37;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Go to Dashboard
      </a>

      <hr style="border-color:#333;margin:24px 0;">

      <p style="color:#666;font-size:12px;text-align:center;">
        NyayMargadarshak — Connecting Citizens with Justice
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'NyayMargadarshak <noreply@nyay.in>',
    to: lawyerEmail,
    subject: `New Client Inquiry from ${clientName} — NyayMargadarshak`,
    html
  });

  console.log("Email sent successfully");

  // Ethereal preview link
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendInquiryNotification };