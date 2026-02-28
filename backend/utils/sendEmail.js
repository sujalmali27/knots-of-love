import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // ✅ This helps prevent crashes in local development environments
      rejectUnauthorized: false 
    }
  });

  const mailOptions = {
    from: `"Knots Of Love" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // ✅ Correctly renders the HTML templates from your controller
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;