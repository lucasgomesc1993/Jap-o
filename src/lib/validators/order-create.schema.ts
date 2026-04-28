import { z } from 'zod';
import { validateProductUrl } from '@/lib/scraper';

export const productUrlSchema = z.string()
  .url({ message: 'URL inválida' })
  .refine((url) => validateProductUrl(url) !== null, {
    message: 'Plataforma não suportada (Aceitamos Amazon JP, Mercari, Rakuten e Yahoo Auctions)'
  });

export const orderCreateSchema = z.object({
  productUrl: productUrlSchema,
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  productImage: z.string().optional(),
  priceJpy: z.number().positive('O preço deve ser maior que zero'),
  quantity: z.number().int().min(1, 'A quantidade mínima é 1'),
  variation: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
