import { z } from 'zod';

export const passwordSchema = z
  .string({ required_error: 'Senha é obrigatória' })
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(72, 'Senha deve ter no máximo 72 caracteres')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Senha deve conter pelo menos uma letra maiúscula',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Senha deve conter pelo menos uma letra minúscula',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Senha deve conter pelo menos um número',
  });
