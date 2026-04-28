import { describe, it, expect } from 'vitest';
import { productUrlSchema } from './product-url.schema';

describe('productUrlSchema', () => {
  it('deve aceitar URLs de domínios permitidos', () => {
    const validUrls = [
      'https://www.amazon.co.jp/dp/B08PC3PG6C',
      'https://jp.mercari.com/item/m123456789',
      'https://item.rakuten.co.jp/shop/item123/',
      'https://shopping.yahoo.co.jp/category/123',
    ];

    validUrls.forEach(url => {
      expect(productUrlSchema.safeParse(url).success).toBe(true);
    });
  });

  it('deve rejeitar URLs de domínios não permitidos', () => {
    const invalidUrls = [
      'https://www.google.com',
      'https://articulo.mercadolibre.com.br/MLB-123',
      'https://www.ebay.com/itm/123',
    ];

    invalidUrls.forEach(url => {
      const result = productUrlSchema.safeParse(url);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Este site ainda não é suportado ou a URL é inválida.');
      }
    });
  });

  it('deve rejeitar strings que não são URLs', () => {
    const notUrls = ['not-a-url', 'ftp://mysite.com', 'just words'];

    notUrls.forEach(url => {
      expect(productUrlSchema.safeParse(url).success).toBe(false);
    });
  });
});
