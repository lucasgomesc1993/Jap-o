import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_missing_key';
if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('RESEND_API_KEY is missing in environment variables.');
}

export const resend = new Resend(resendApiKey);
