import { describe, it, expect } from 'vitest';
import { markPurchasedSchema } from './mark-purchased.schema';

describe('markPurchasedSchema', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  it('deve validar um input correto', () => {
    const data = {
      realPriceJpy: 1500,
      arrivalExpectedAt: futureDate,
      receiptUrl: 'https://example.com/receipt.jpg',
    };
    const result = markPurchasedSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve falhar se realPriceJpy for <= 0', () => {
    const data = {
      realPriceJpy: 0,
      arrivalExpectedAt: futureDate,
      receiptUrl: 'https://example.com/receipt.jpg',
    };
    const result = markPurchasedSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O preço deve ser maior que zero');
    }
  });

  it('deve falhar se arrivalExpectedAt for no passado', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const data = {
      realPriceJpy: 1500,
      arrivalExpectedAt: pastDate,
      receiptUrl: 'https://example.com/receipt.jpg',
    };
    const result = markPurchasedSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('A data de chegada deve ser no futuro');
    }
  });

  it('deve falhar se receiptUrl for inválida', () => {
    const data = {
      realPriceJpy: 1500,
      arrivalExpectedAt: futureDate,
      receiptUrl: 'not-a-url',
    };
    const result = markPurchasedSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('URL do comprovante inválida');
    }
  });
});
