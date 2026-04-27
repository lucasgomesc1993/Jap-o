import { z } from 'zod';

export const phoneSchema = z
  .string({ required_error: 'Telefone é obrigatório' })
  .min(1, 'Telefone é obrigatório')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length >= 10 && val.length <= 11, {
    message: 'Telefone deve conter 10 ou 11 dígitos',
  });
