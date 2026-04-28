import { z } from 'zod';

export const paymentPixSchema = z.object({
  amount: z.number().positive('O valor deve ser maior que zero'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  referenceId: z.string().min(1, 'O ID de referência é obrigatório'),
});

export type PaymentPixInput = z.infer<typeof paymentPixSchema>;
