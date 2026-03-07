import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // ✅ Switch to Mailtrap to bypass Render's Gmail network block
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // sandbox.smtp.mailtrap.io
    port: 2525,                   // ✅ Port 2525 is open on Render
    auth: {
      user: process.env.EMAIL_USER, // 99d9b9d4040456
      pass: process.env.EMAIL_PASS, // 0b87afe3d68497
    },
  });

  const mailOptions = {
    from: '"Knots Of Love 🧶" <no-reply@knotsoflove.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Success! Email captured in Mailtrap Sandbox.`);
  } catch (error) {
    // This will now log Mailtrap-specific errors if any occur
    console.error("❌ Email Error Details:", error.message);
    throw new Error('Email delivery failed');
  }
};

export default sendEmail;