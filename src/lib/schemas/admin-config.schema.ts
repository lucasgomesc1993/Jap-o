import { z } from 'zod';
import { ShippingMethod, ExtraServiceType } from '@prisma/client';

export const rateRangeSchema = z.object({
  min: z.number().min(0, 'Peso mínimo deve ser >= 0'),
  max: z.number().gt(0, 'Peso máximo deve ser > 0'),
  basePrice: z.number().min(0, 'Preço base deve ser >= 0'),
  pricePerGram: z.number().min(0, 'Preço por grama deve ser >= 0'),
}).refine(data => data.max > data.min, {
  message: 'Peso máximo deve ser maior que o peso mínimo',
  path: ['max'],
});

export const shippingRatesSchema = z.record(
  z.nativeEnum(ShippingMethod),
  z.array(rateRangeSchema)
);

export const extraServicePricesSchema = z.record(
  z.nativeEnum(ExtraServiceType),
  z.number().min(0, 'Preço deve ser >= 0')
);

export const adminConfigSchema = z.object({
  serviceFeePercent: z.number().min(0, 'Taxa deve ser >= 0').max(100, 'Taxa máxima é 100%'),
  fixedFeeBrl: z.number().min(0, 'Taxa fixa deve ser >= 0'),
  freeStorageDays: z.number().int().min(0, 'Dias devem ser >= 0'),
  storageFeePerDay: z.number().min(0, 'Cobrança por dia deve ser >= 0'),
  jpyExchangeRate: z.number().gt(0, 'Cotação deve ser > 0'),
  shippingRates: shippingRatesSchema,
  extraServicePrices: extraServicePricesSchema,
  allowedPlatforms: z.array(z.string().url('Domínio inválido')).min(1, 'Adicione pelo menos uma plataforma'),
  prohibitedProducts: z.array(z.string().min(1, 'Nome do produto não pode ser vazio')),
});

export const legalDocumentSchema = z.object({
  content: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
});

export type AdminConfigInput = z.infer<typeof adminConfigSchema>;
export type LegalDocumentInput = z.infer<typeof legalDocumentSchema>;
