import { describe, it, expect } from 'vitest';
import { emailSchema } from './email.schema';

describe('emailSchema', () => {
  it('aceita email válido', () => {
    expect(emailSchema.parse('user@example.com')).toBe('user@example.com');
  });

  it('converte para lowercase', () => {
    expect(emailSchema.parse('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('remove espaços', () => {
    expect(emailSchema.parse('  user@example.com  ')).toBe('user@example.com');
  });

  it('rejeita campo vazio', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejeita email sem @', () => {
    const result = emailSchema.safeParse('userexample.com');
    expect(result.success).toBe(false);
  });

  it('rejeita email sem domínio', () => {
    const result = emailSchema.safeParse('user@');
    expect(result.success).toBe(false);
  });

  it('mensagem de obrigatoriedade', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail é obrigatório');
    }
  });

  it('mensagem de email inválido', () => {
    const result = emailSchema.safeParse('invalido');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido');
    }
  });
});
