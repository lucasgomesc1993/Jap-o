import { describe, it, expect } from 'vitest';
import { cpfSchema, isValidCpf } from './cpf.schema';

describe('cpfSchema', () => {
  describe('CPFs válidos', () => {
    it('aceita CPF válido padrão', () => {
      expect(cpfSchema.parse('529.982.247-25')).toBe('52998224725');
    });

    it('aceita CPF com remanescente 10 no primeiro dígito', () => {
      // 000.000.006-04 -> sum1=12, rem1=120%11=10->0. sum2=18+8=26, rem2=260%11=7. 
      // Espera aí, 000.000.006-0x. sum1=12. rem1=10. digit1=0.
      // sum2 = 6*3 + 0*2 = 18. rem2=180%11=4. 
      // Então 000.000.006-04 é válido.
      expect(cpfSchema.parse('000.000.006-04')).toBe('00000000604');
    });

    it('aceita CPF com remanescente 10 no segundo dígito', () => {
      // 000.000.050-70 -> sum1=15, rem1=150%11=7. sum2=5*4+7*2=34, rem2=340%11=10->0.
      expect(cpfSchema.parse('000.000.050-70')).toBe('00000005070');
    });
  });

  describe('CPFs inválidos', () => {
    it('rejeita CPFs com dígitos verificadores errados', () => {
      expect(cpfSchema.safeParse('52998224715').success).toBe(false);
      expect(cpfSchema.safeParse('52998224724').success).toBe(false);
    });

    it('rejeita sequências repetidas', () => {
      expect(cpfSchema.safeParse('00000000000').success).toBe(false);
      expect(cpfSchema.safeParse('11111111111').success).toBe(false);
    });

    it('rejeita CPFs com tamanho errado', () => {
      expect(cpfSchema.safeParse('123').success).toBe(false);
    });
  });
});

describe('isValidCpf', () => {
  it('cobre ramificações de erro de tamanho e repetição', () => {
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCpf('22222222222')).toBe(false);
  });
});
