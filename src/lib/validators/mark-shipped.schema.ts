import { z } from 'zod';

export const markShippedSchema = z.object({
  trackingCode: z.string().min(1, 'Código de rastreio é obrigatório'),
  finalWeightGrams: z.number().int().positive('Peso final deve ser maior que zero'),
  realShippingCostBrl: z.number().nonnegative('Custo real não pode ser negativo').optional(),
});

export type MarkShippedInput = z.infer<typeof markShippedSchema>;
