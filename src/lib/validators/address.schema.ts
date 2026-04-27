import { z } from 'zod';
import { cepSchema } from './cep.schema';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const addressSchema = z.object({
  label: z.string().min(1, 'Nome do endereço é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  cep: cepSchema,
  street: z.string().min(1, 'Rua é obrigatória').max(200, 'Rua deve ter no máximo 200 caracteres'),
  number: z.string().min(1, 'Número é obrigatório').max(10, 'Número deve ter no máximo 10 caracteres'),
  complement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100, 'Bairro deve ter no máximo 100 caracteres'),
  city: z.string().min(1, 'Cidade é obrigatória').max(100, 'Cidade deve ter no máximo 100 caracteres'),
  state: z.enum(BRAZILIAN_STATES, {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
export { BRAZILIAN_STATES };
