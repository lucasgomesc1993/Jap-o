import { z } from 'zod';

export const emailSchema = z
  .string({ required_error: 'E-mail é obrigatório' })
  .min(1, 'E-mail é obrigatório')
  .trim()
  .toLowerCase()
  .email('E-mail inválido');
