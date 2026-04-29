import { z } from 'zod';

export const manualTransactionSchema = z.object({
  type: z.enum(['MANUAL_CREDIT', 'MANUAL_DEBIT'], {
    errorMap: () => ({ message: 'Tipo de transação inválido' }),
  }),
  amount: z
    .number({
      required_error: 'Valor é obrigatório',
      invalid_type_error: 'Valor deve ser um número',
    })
    .positive('O valor deve ser maior que zero'),
  reason: z
    .string({
      required_error: 'Motivo é obrigatório',
    })
    .min(5, 'O motivo deve ter pelo menos 5 caracteres')
    .max(255, 'O motivo deve ter no máximo 255 caracteres'),
});

export type ManualTransactionInput = z.infer<typeof manualTransactionSchema>;
