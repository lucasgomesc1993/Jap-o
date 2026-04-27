import { describe, it, expect } from 'vitest';
import { cpfSchema, isValidCpf } from './cpf.schema';

describe('cpfSchema', () => {
  describe('CPFs válidos', () => {
    it('aceita CPF válido sem formatação', () => {
      expect(cpfSchema.parse('52998224725')).toBe('52998224725');
    });

    it('aceita CPF válido com formatação', () => {
      expect(cpfSchema.parse('529.982.247-25')).toBe('52998224725');
    });

    it('aceita CPF 11144477735', () => {
      expect(cpfSchema.parse('11144477735')).toBe('11144477735');
    });
  });

  describe('CPFs inválidos', () => {
    it('rejeita campo vazio', () => {
      const result = cpfSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejeita CPF com menos de 11 dígitos', () => {
      const result = cpfSchema.safeParse('1234567');
      expect(result.success).toBe(false);
    });

    it('rejeita CPF com mais de 11 dígitos', () => {
      const result = cpfSchema.safeParse('123456789012');
      expect(result.success).toBe(false);
    });

    it('rejeita sequência repetida (11111111111)', () => {
      const result = cpfSchema.safeParse('11111111111');
      expect(result.success).toBe(false);
    });

    it('rejeita sequência repetida (00000000000)', () => {
      const result = cpfSchema.safeParse('00000000000');
      expect(result.success).toBe(false);
    });

    it('rejeita CPF com dígito verificador incorreto', () => {
      const result = cpfSchema.safeParse('52998224726');
      expect(result.success).toBe(false);
    });
  });

  describe('mensagens em pt-BR', () => {
    it('mensagem de obrigatoriedade', () => {
      const result = cpfSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('CPF é obrigatório');
      }
    });
  });
});

describe('isValidCpf', () => {
  it('retorna true para CPF válido', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('retorna false para CPF inválido', () => {
    expect(isValidCpf('12345678901')).toBe(false);
  });
});
