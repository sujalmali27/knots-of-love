import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // ✅ Switch to explicit Host/Port to bypass Render network blocks
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Must be false for port 587
    auth: {
      user: process.env.EMAIL_USER, // sujalmali27@gmail.com
      pass: process.env.EMAIL_PASS, // vixusegzdauvgzxj
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });

  const mailOptions = {
    from: `"Knots Of Love 🧶" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to: ${options.email}`);
  } catch (error) {
    // This will now catch and explain any new errors in the Render logs
    console.error("❌ Gmail Error Details:", error.message);
    throw new Error('Email delivery failed');
  }
};

export default sendEmail;