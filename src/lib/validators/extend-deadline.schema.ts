import { z } from 'zod';

export const extendDeadlineSchema = z.object({
  days: z.coerce.number().int().min(1, 'Deve ser pelo menos 1 dia'),
  reason: z.string().min(3, 'O motivo deve ter pelo menos 3 caracteres'),
});

export type ExtendDeadlineInput = z.infer<typeof extendDeadlineSchema>;
