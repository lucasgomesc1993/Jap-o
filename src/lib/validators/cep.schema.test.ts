import { describe, it, expect } from 'vitest';
import { cepSchema } from './cep.schema';

describe('cepSchema', () => {
  it('aceita CEP válido sem formatação', () => {
    expect(cepSchema.parse('01001000')).toBe('01001000');
  });

  it('aceita CEP válido com formatação', () => {
    expect(cepSchema.parse('01001-000')).toBe('01001000');
  });

  it('rejeita campo vazio', () => {
    const result = cepSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejeita CEP com menos de 8 dígitos', () => {
    const result = cepSchema.safeParse('1234567');
    expect(result.success).toBe(false);
  });

  it('rejeita CEP com mais de 8 dígitos', () => {
    const result = cepSchema.safeParse('123456789');
    expect(result.success).toBe(false);
  });

  it('mensagem de obrigatoriedade', () => {
    const result = cepSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('CEP é obrigatório');
    }
  });

  it('mensagem de tamanho', () => {
    const result = cepSchema.safeParse('123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'CEP deve conter 8 dígitos')).toBe(true);
    }
  });
});
