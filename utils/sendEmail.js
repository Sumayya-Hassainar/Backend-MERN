// utils/sendEmail.js
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not configured in .env (EMAIL_USER / EMAIL_PASS)");
  }

  // Use a secure transport (Gmail example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // or `${process.env.ADMIN_NAME} <${process.env.EMAIL_USER}>`
    to,
    subject,
    text: text || "",
    html: html || "",
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
