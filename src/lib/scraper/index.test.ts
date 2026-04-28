import { describe, it, expect, beforeEach } from 'vitest';
import { scrapeProduct, validateProductUrl } from './index';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/setup';

describe('Product Scraper Utility', () => {
  
  describe('validateProductUrl', () => {
    it('deve identificar Amazon JP corretamente', () => {
      expect(validateProductUrl('https://www.amazon.co.jp/dp/B08P54J2B6')).toBe('Amazon JP');
    });

    it('deve identificar Mercari corretamente', () => {
      expect(validateProductUrl('https://jp.mercari.com/item/m123456789')).toBe('Mercari');
    });

    it('deve identificar Rakuten corretamente', () => {
      expect(validateProductUrl('https://item.rakuten.co.jp/shop/item123/')).toBe('Rakuten');
    });

    it('deve identificar Yahoo Auctions corretamente', () => {
      expect(validateProductUrl('https://page.auctions.yahoo.co.jp/jp/auction/x123')).toBe('Yahoo Auctions');
    });

    it('deve retornar null para URL malformada', () => {
      expect(validateProductUrl('not-a-url')).toBeNull();
    });
  });

  describe('scrapeProduct', () => {
    it('deve extrair dados da Rakuten', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="item_name">Rakuten Item</div>
            <div class="price2">¥5,000</div>
            <meta property="og:image" content="rakuten.jpg">
          </body>
        </html>
      `;

      server.use(
        http.get('https://item.rakuten.co.jp/test', () => {
          return new HttpResponse(mockHtml, { headers: { 'Content-Type': 'text/html' } });
        })
      );

      const result = await scrapeProduct('https://item.rakuten.co.jp/test');
      expect(result.name).toBe('Rakuten Item');
      expect(result.priceJpy).toBe(5000);
      expect(result.image).toBe('rakuten.jpg');
    });

    it('deve extrair dados do Yahoo Auctions', async () => {
      const mockHtml = `
        <html>
          <body>
            <h1 class="ProductTitle__text">Yahoo Item</h1>
            <span class="Price__value">10,000</span>
            <div class="ProductImage__img"><img src="yahoo.jpg"></div>
          </body>
        </html>
      `;

      server.use(
        http.get('https://page.auctions.yahoo.co.jp/jp/auction/test', () => {
          return new HttpResponse(mockHtml, { headers: { 'Content-Type': 'text/html' } });
        })
      );

      const result = await scrapeProduct('https://page.auctions.yahoo.co.jp/jp/auction/test');
      expect(result.name).toBe('Yahoo Item');
      expect(result.priceJpy).toBe(10000);
      expect(result.image).toBe('yahoo.jpg');
    });

    it('deve usar fallbacks quando dados específicos da plataforma faltam', async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Generic Title</title>
            <meta property="og:image" content="generic.jpg">
          </head>
          <body>
            <!-- Sem seletores específicos da Amazon -->
          </body>
        </html>
      `;

      server.use(
        http.get('https://www.amazon.co.jp/fallback', () => {
          return new HttpResponse(mockHtml, { headers: { 'Content-Type': 'text/html' } });
        })
      );

      const result = await scrapeProduct('https://www.amazon.co.jp/fallback');
      expect(result.name).toBe('Generic Title');
      expect(result.priceJpy).toBe(0); // parseInt(undefined) || 0
      expect(result.image).toBe('generic.jpg');
    });

    it('deve lidar com dados vazios em todas as plataformas', async () => {
      const emptyHtml = '<html><body></body></html>';
      const urls = [
        'https://www.amazon.co.jp/empty',
        'https://jp.mercari.com/item/empty',
        'https://item.rakuten.co.jp/empty',
        'https://page.auctions.yahoo.co.jp/jp/auction/empty'
      ];

      for (const url of urls) {
        server.use(http.get(url, () => new HttpResponse(emptyHtml, { headers: { 'Content-Type': 'text/html' } })));
        const result = await scrapeProduct(url);
        expect(result.name).toBeDefined();
        expect(result.priceJpy).toBe(0);
      }
    });

    it('deve lançar erro quando a resposta não for ok (ex: 404)', async () => {
      server.use(
        http.get('https://www.amazon.co.jp/error', () => {
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        })
      );

      await expect(scrapeProduct('https://www.amazon.co.jp/error')).rejects.toThrow('Falha ao carregar a página: Not Found');
    });

    it('deve extrair dados da Amazon JP', async () => {
      const mockHtml = `
        <html>
          <body>
            <span id="productTitle">Sony PlayStation 5</span>
            <span class="a-price-whole">60,480</span>
            <img id="landingImage" src="ps5.jpg" />
          </body>
        </html>
      `;

      server.use(
        http.get('https://www.amazon.co.jp/test', () => {
          return new HttpResponse(mockHtml, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
      );

      const result = await scrapeProduct('https://www.amazon.co.jp/test');

      expect(result.name).toBe('Sony PlayStation 5');
      expect(result.priceJpy).toBe(60480);
      expect(result.image).toBe('ps5.jpg');
    });

    it('deve extrair dados do Mercari via meta tags', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="Figura Anime | Mercari">
            <meta property="product:price:amount" content="1500">
            <meta property="og:image" content="anime.jpg">
          </head>
        </html>
      `;

      server.use(
        http.get('https://jp.mercari.com/item/test', () => {
          return new HttpResponse(mockHtml, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
      );

      const result = await scrapeProduct('https://jp.mercari.com/item/test');

      expect(result.name).toBe('Figura Anime');
      expect(result.priceJpy).toBe(1500);
      expect(result.image).toBe('anime.jpg');
    });

    it('deve lançar erro para plataforma não suportada', async () => {
      await expect(scrapeProduct('https://google.com')).rejects.toThrow('Plataforma não suportada');
    });
  });
});
