import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  name: string;
  priceJpy: number;
  image?: string;
  platform: string;
}

const PLATFORMS = {
  AMAZON: 'Amazon JP',
  MERCARI: 'Mercari',
  RAKUTEN: 'Rakuten',
  YAHOO_AUCTIONS: 'Yahoo Auctions',
};

/**
 * Valida se a URL pertence a uma das plataformas suportadas.
 */
export function validateProductUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname;
    
    if (domain.includes('amazon.co.jp')) return PLATFORMS.AMAZON;
    if (domain.includes('mercari.com')) return PLATFORMS.MERCARI;
    if (domain.includes('rakuten.co.jp')) return PLATFORMS.RAKUTEN;
    if (domain.includes('yahoo.co.jp') && domain.includes('auctions')) return PLATFORMS.YAHOO_AUCTIONS;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Realiza o scraping dos dados do produto.
 */
export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const platform = validateProductUrl(url);
  if (!platform) {
    throw new Error('Plataforma não suportada ou URL inválida');
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar a página: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let name = '';
  let priceJpy = 0;
  let image = '';

  switch (platform) {
    case PLATFORMS.AMAZON:
      name = $('#productTitle').text().trim();
      // Preço na Amazon JP pode estar em vários lugares
      const amazonPrice = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
      priceJpy = parseInt(amazonPrice) || 0;
      image = $('#landingImage').attr('src') || '';
      break;

    case PLATFORMS.MERCARI:
      name = $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() || '';
      const mercariPrice = $('meta[property="product:price:amount"]').attr('content');
      priceJpy = parseInt(mercariPrice || '0');
      image = $('meta[property="og:image"]').attr('content') || '';
      break;

    case PLATFORMS.RAKUTEN:
      name = $('.item_name').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
      const rakutenPrice = $('.price2').text().replace(/[^0-9]/g, '') || $('meta[property="product:price:amount"]').attr('content');
      priceJpy = parseInt(rakutenPrice || '0');
      image = $('meta[property="og:image"]').attr('content') || '';
      break;

    case PLATFORMS.YAHOO_AUCTIONS:
      name = $('.ProductTitle__text').text().trim() || $('meta[property="og:title"]').attr('content') || '';
      const yahooPrice = $('.Price__value').first().text().replace(/[^0-9]/g, '');
      priceJpy = parseInt(yahooPrice) || 0;
      image = $('.ProductImage__img img').attr('src') || $('meta[property="og:image"]').attr('content') || '';
      break;
  }

  // Fallback genérico se falhar
  if (!name) name = $('title').text().trim();
  if (!image) image = $('meta[property="og:image"]').attr('content') || '';

  return {
    name,
    priceJpy,
    image,
    platform,
  };
}
