import { describe, it, expect } from 'vitest';
import { warehouseItemSchema } from './warehouse-item.schema';

describe('WarehouseItem Schema', () => {
  const validData = {
    name: 'Action Figure Goku',
    weightGrams: 500,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
  };

  it('deve validar dados corretos', () => {
    const result = warehouseItemSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar nome vazio', () => {
    const result = warehouseItemSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome do item é obrigatório');
    }
  });

  it('deve rejeitar peso zero ou negativo', () => {
    const resultZero = warehouseItemSchema.safeParse({ ...validData, weightGrams: 0 });
    const resultNeg = warehouseItemSchema.safeParse({ ...validData, weightGrams: -10 });
    
    expect(resultZero.success).toBe(false);
    expect(resultNeg.success).toBe(false);
  });

  it('deve rejeitar dimensões zero ou negativas', () => {
    const resultLength = warehouseItemSchema.safeParse({ ...validData, lengthCm: 0 });
    const resultWidth = warehouseItemSchema.safeParse({ ...validData, widthCm: -1 });
    const resultHeight = warehouseItemSchema.safeParse({ ...validData, heightCm: 0 });

    expect(resultLength.success).toBe(false);
    expect(resultWidth.success).toBe(false);
    expect(resultHeight.success).toBe(false);
  });
});
