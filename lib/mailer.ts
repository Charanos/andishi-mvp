import nodemailer from 'nodemailer';

// Centralized mailer using SMTP creds from environment
// Required envs: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM

const smtpHost = process.env.SMTP_HOST as string;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = String(process.env.SMTP_SECURE || 'true') === 'true';
const smtpUser = process.env.SMTP_USER as string;
const smtpPass = process.env.SMTP_PASS as string;
const defaultFrom = process.env.EMAIL_FROM || `Andishi Academy <no-reply@andishiacademy.co.ke>`;

if (!smtpHost || !smtpUser || !smtpPass) {
  // Do not throw on module import to avoid build failures on Vercel preview without secrets
  console.warn('[mailer] Missing SMTP environment variables. Email sending will fail until configured.');
}

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure, // true for 465
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  headers?: Record<string, string>;
};

export async function verifyTransport(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error('[mailer] SMTP verification failed:', err);
    return false;
  }
}

export async function sendEmail(options: SendEmailOptions) {
  const mail = {
    from: options.from || defaultFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    headers: options.headers,
  };

  return transporter.sendMail(mail);
}
