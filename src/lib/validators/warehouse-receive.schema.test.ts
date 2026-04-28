import { describe, it, expect } from 'vitest';
import { warehouseReceiveSchema } from './warehouse-receive.schema';

describe('warehouseReceiveSchema', () => {
  const validData = {
    photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    weightGrams: 500,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
    location: 'A1-B2',
  };

  it('should validate correct data', () => {
    const result = warehouseReceiveSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject less than 2 photos', () => {
    const result = warehouseReceiveSchema.safeParse({
      ...validData,
      photos: ['https://example.com/photo1.jpg'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mínimo de 2 fotos obrigatório');
    }
  });

  it('should reject more than 3 photos', () => {
    const result = warehouseReceiveSchema.safeParse({
      ...validData,
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
        'https://example.com/photo4.jpg',
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Máximo de 3 fotos permitido');
    }
  });

  it('should reject zero or negative weight', () => {
    const result = warehouseReceiveSchema.safeParse({
      ...validData,
      weightGrams: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Peso deve ser maior que zero');
    }
  });

  it('should reject zero or negative dimensions', () => {
    const result = warehouseReceiveSchema.safeParse({
      ...validData,
      lengthCm: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Comprimento deve ser maior que zero');
    }
  });

  it('should reject empty location', () => {
    const result = warehouseReceiveSchema.safeParse({
      ...validData,
      location: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Localização no armazém é obrigatória');
    }
  });
});
