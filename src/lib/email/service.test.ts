import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from './service';
import { resend } from './client';

vi.mock('./client', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe('Email Service', () => {
  it('deve chamar o resend.emails.send com os parâmetros corretos', async () => {
    const mockData = { id: '123' };
    (resend.emails.send as any).mockResolvedValue({ data: mockData, error: null });

    const result = await sendEmail({
      to: 'teste@exemplo.com',
      subject: 'Assunto Teste',
      react: { type: 'div', props: { children: 'Olá' } } as any,
    });

    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'teste@exemplo.com',
        subject: 'Assunto Teste',
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('deve retornar erro quando o resend falha', async () => {
    const mockError = { message: 'Erro ao enviar' };
    (resend.emails.send as any).mockResolvedValue({ data: null, error: mockError });

    const result = await sendEmail({
      to: 'teste@exemplo.com',
      subject: 'Assunto Teste',
      react: { type: 'div', props: { children: 'Olá' } } as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toEqual(mockError);
  });
});
