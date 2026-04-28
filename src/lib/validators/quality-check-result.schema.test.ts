import { describe, it, expect } from 'vitest';
import { qualityCheckResultSchema } from './quality-check-result.schema';

describe('qualityCheckResultSchema', () => {
  it('should validate OK without photo', () => {
    const result = qualityCheckResultSchema.safeParse({
      result: 'OK',
      notes: 'Everything looks good',
    });
    expect(result.success).toBe(true);
  });

  it('should validate PROBLEM with photo', () => {
    const result = qualityCheckResultSchema.safeParse({
      result: 'PROBLEM',
      notes: 'Item is damaged',
      photo: 'https://example.com/damage.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should reject PROBLEM without photo', () => {
    const result = qualityCheckResultSchema.safeParse({
      result: 'PROBLEM',
      notes: 'Item is damaged',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Foto de problema obrigatória se resultado for PROBLEM'
      );
    }
  });

  it('should reject invalid result enum', () => {
    const result = qualityCheckResultSchema.safeParse({
      result: 'INVALID',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Resultado deve ser OK ou PROBLEM');
    }
  });
});
