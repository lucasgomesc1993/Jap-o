import { z } from 'zod';

export const walletAddCreditSchema = z.object({
  amount: z.number()
    .min(10, 'O valor mínimo para recarga é R$ 10,00')
    .positive('O valor deve ser positivo'),
});

export type WalletAddCreditInput = z.infer<typeof walletAddCreditSchema>;
