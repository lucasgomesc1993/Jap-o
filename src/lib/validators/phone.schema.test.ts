import { describe, it, expect } from 'vitest';
import { phoneSchema } from './phone.schema';

describe('phoneSchema', () => {
  it('aceita telefone fixo (10 dígitos)', () => {
    expect(phoneSchema.parse('1133334444')).toBe('1133334444');
  });

  it('aceita celular (11 dígitos)', () => {
    expect(phoneSchema.parse('11999998888')).toBe('11999998888');
  });

  it('aceita com formatação', () => {
    expect(phoneSchema.parse('(11) 99999-8888')).toBe('11999998888');
  });

  it('rejeita com menos de 10 dígitos', () => {
    const result = phoneSchema.safeParse('1234');
    expect(result.success).toBe(false);
  });

  it('rejeita com mais de 11 dígitos', () => {
    const result = phoneSchema.safeParse('123456789012');
    expect(result.success).toBe(false);
  });

  it('rejeita campo vazio', () => {
    const result = phoneSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Telefone é obrigatório');
    }
  });

  it('mensagem de tamanho', () => {
    const result = phoneSchema.safeParse('1234');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(
        (i) => i.message === 'Telefone deve conter 10 ou 11 dígitos',
      )).toBe(true);
    }
  });
});
