import { describe, it, expect } from 'vitest';
import { passwordSchema } from './password.schema';

describe('passwordSchema', () => {
  it('aceita senha válida', () => {
    expect(passwordSchema.parse('Abc12345')).toBe('Abc12345');
  });

  it('rejeita senha curta', () => {
    const result = passwordSchema.safeParse('Ab1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter no mínimo 8 caracteres');
    }
  });

  it('rejeita senha longa', () => {
    const result = passwordSchema.safeParse('A'.repeat(73));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter no máximo 72 caracteres');
    }
  });

  it('rejeita senha sem maiúscula', () => {
    const result = passwordSchema.safeParse('abc12345');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(
        (i) => i.message === 'Senha deve conter pelo menos uma letra maiúscula',
      )).toBe(true);
    }
  });

  it('rejeita senha sem minúscula', () => {
    const result = passwordSchema.safeParse('ABC12345');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(
        (i) => i.message === 'Senha deve conter pelo menos uma letra minúscula',
      )).toBe(true);
    }
  });

  it('rejeita senha sem número', () => {
    const result = passwordSchema.safeParse('Abcdefgh');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(
        (i) => i.message === 'Senha deve conter pelo menos um número',
      )).toBe(true);
    }
  });

  it('mensagem de obrigatoriedade', () => {
    const result = passwordSchema.safeParse(undefined);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha é obrigatória');
    }
  });
});
