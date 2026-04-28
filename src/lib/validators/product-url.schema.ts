import { z } from 'zod';

const ALLOWED_DOMAINS = [
  'amazon.co.jp',
  'mercari.com/jp',
  'jp.mercari.com',
  'rakuten.co.jp',
  'shopping.yahoo.co.jp',
  'item.rakuten.co.jp',
  'suruga-ya.jp',
  'animate-onlineshop.jp',
  'p-bandai.jp',
  'zozo.jp',
];

export const productUrlSchema = z.string()
  .url('URL inválida')
  .refine((url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return ALLOWED_DOMAINS.some(allowed => domain.includes(allowed));
    } catch {
      return false;
    }
  }, {
    message: 'Este site ainda não é suportado ou a URL é inválida.',
  });

export type ProductUrl = z.infer<typeof productUrlSchema>;
