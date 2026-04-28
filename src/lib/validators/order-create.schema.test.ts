import { describe, it, expect } from 'vitest';
import { orderCreateSchema } from './order-create.schema';

describe('Order Create Schema', () => {
  const validData = {
    productUrl: 'https://www.amazon.co.jp/dp/B08P2C9PJM',
    productName: 'Nintendo Switch',
    productImage: 'https://m.media-amazon.com/images/I/image.jpg',
    priceJpy: 35000,
    quantity: 1,
    variation: 'Neon Blue/Red',
    notes: 'Favor conferir se é a versão OLED'
  };

  it('deve validar dados corretos', () => {
    const result = orderCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar URLs de domínios não suportados', () => {
    const data = { ...validData, productUrl: 'https://www.ebay.com/itm/123' };
    const result = orderCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Plataforma não suportada');
    }
  });

  it('deve validar quantidade mínima', () => {
    const data = { ...validData, quantity: 0 };
    const result = orderCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve validar preço positivo', () => {
    const data = { ...validData, priceJpy: -100 };
    const result = orderCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve exigir nome do produto', () => {
    const data = { ...validData, productName: '' };
    const result = orderCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
