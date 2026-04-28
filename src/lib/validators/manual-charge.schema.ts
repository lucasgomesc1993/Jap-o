import { z } from 'zod';

export const manualChargeSchema = z.object({
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  reason: z.string().min(3, 'O motivo deve ter pelo menos 3 caracteres'),
});

export type ManualChargeInput = z.infer<typeof manualChargeSchema>;
