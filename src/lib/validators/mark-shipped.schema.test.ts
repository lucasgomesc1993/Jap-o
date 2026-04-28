import { describe, it, expect } from 'vitest';
import { markShippedSchema } from './mark-shipped.schema';

describe('markShippedSchema', () => {
  it('deve validar um input correto', () => {
    const input = {
      trackingCode: 'AA123456789JP',
      finalWeightGrams: 1500,
    };
    const result = markShippedSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar trackingCode vazio', () => {
    const input = {
      trackingCode: '',
      finalWeightGrams: 1500,
    };
    const result = markShippedSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Código de rastreio é obrigatório');
    }
  });

  it('deve rejeitar peso zero ou negativo', () => {
    const input = {
      trackingCode: 'AA123456789JP',
      finalWeightGrams: 0,
    };
    const result = markShippedSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Peso final deve ser maior que zero');
    }
  });
});
