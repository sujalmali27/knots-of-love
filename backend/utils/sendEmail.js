import { Resend } from 'resend';

// ✅ Initialize Resend with your new API Key from Render Environment
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      // ⚠️ Free tier requirement: You MUST use this 'from' address
      from: 'Knots of Love <onboarding@resend.dev>',
      
      // ⚠️ Free tier requirement: This MUST be your GitHub/Resend account email
      to: options.email, 
      
      subject: options.subject,
      html: options.message,
    });

    console.log("✅ Real email sent successfully via Resend!", data);
  } catch (error) {
    // This will catch issues like using an unverified "to" address
    console.error("❌ Resend Error:", error.message);
    throw new Error('Email delivery failed');
  }
};

export default sendEmail;