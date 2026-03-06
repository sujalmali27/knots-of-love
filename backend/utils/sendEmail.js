import { Resend } from 'resend';

const sendEmail = async (options) => {
  // ✅ Move this inside the function to ensure process.env is ready
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      // ⚠️ Free Tier Requirement: sender must be this address
      from: 'Knots of Love <onboarding@resend.dev>',
      
      // ⚠️ Free Tier Requirement: recipient must be sujalmali27@gmail.com
      to: options.email, 
      
      subject: options.subject,
      html: options.message,
    });

    if (error) {
      console.error("❌ Resend API Error:", error.message);
      throw new Error(error.message);
    }

    console.log("✅ Success! Real email delivered via Resend.", data);
  } catch (err) {
    console.error("❌ Email System Failure:", err.message);
    throw new Error('Email delivery failed');
  }
};

export default sendEmail;