import { z } from 'zod';
import { emailSchema } from './email.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;
