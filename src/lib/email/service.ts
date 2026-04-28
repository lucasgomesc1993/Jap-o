import { resend } from './client';
import React from 'react';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, react, html, text }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NipponBox <onboarding@resend.dev>', // Usando domínio padrão do Resend para teste
      to,
      subject,
      react,
      html,
      text,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return { success: false, error };
  }
}
