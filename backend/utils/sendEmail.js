import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // ✅ Optimized for Render Production
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Your 16-digit App Password
    },
    // Adding stability for cloud-to-cloud connections
    tls: {
      rejectUnauthorized: false 
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
    console.log(`✅ Email sent to: ${options.email}`);
  } catch (error) {
    // This log is CRITICAL. It tells you the EXACT reason Gmail rejected it.
    console.error("❌ Gmail Error Details:", error.message);
    
    // We throw the error so your controller's catch block can catch it
    throw new Error('Email delivery failed');
  }
};

export default sendEmail;