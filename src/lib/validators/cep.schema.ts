import { z } from 'zod';

export const cepSchema = z
  .string({ required_error: 'CEP é obrigatório' })
  .min(1, 'CEP é obrigatório')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 8, {
    message: 'CEP deve conter 8 dígitos',
  })
  .refine((val) => /^\d{8}$/.test(val), {
    message: 'CEP deve conter apenas números',
  });
