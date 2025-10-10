import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html } = options;
  
  try {
    // Resend kullanarak email gönder
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'AtlastBoost <noreply@atlastboost.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Send email error:', error);
    return null;
  }
}

