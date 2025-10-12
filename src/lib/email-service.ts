interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html } = options;
  
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 Email service not configured (RESEND_API_KEY missing), skipping email to:', to);
    return null;
  }
  
  try {
    // Lazy load Resend to avoid build errors when not configured
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'AtlastBoost <noreply@atlastboost.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      return null;
    }

    console.log('✅ Email sent successfully to:', to);
    return data;
  } catch (error) {
    console.error('❌ Send email error:', error);
    return null;
  }
}

