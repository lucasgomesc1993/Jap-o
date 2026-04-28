import { z } from 'zod';
import { ExtraServiceType } from '@prisma/client';

export const extraServiceSchema = z.object({
  warehouseItemId: z.string({
    required_error: 'ID do item é obrigatório',
  }).uuid('ID do item inválido'),
  type: z.string().refine((val) => Object.values(ExtraServiceType).includes(val as any), {
    message: 'Tipo de serviço inválido',
  }) as z.ZodType<ExtraServiceType>,
});

export type ExtraServiceInput = z.infer<typeof extraServiceSchema>;
