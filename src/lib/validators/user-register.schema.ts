import { z } from 'zod';
import { cpfSchema } from './cpf.schema';
import { emailSchema } from './email.schema';
import { passwordSchema } from './password.schema';
import { phoneSchema } from './phone.schema';
import { addressSchema } from './address.schema';

export const userRegisterSchema = z.object({
  fullName: z
    .string({ required_error: 'Nome completo é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  cpf: cpfSchema,
  phone: phoneSchema,
  address: addressSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
