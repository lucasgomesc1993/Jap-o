import { z } from 'zod';

export const markPurchasedSchema = z.object({
  realPriceJpy: z.number({
    required_error: 'O preço real em Iene é obrigatório',
    invalid_type_error: 'O preço real deve ser um número',
  }).positive('O preço deve ser maior que zero'),
  arrivalExpectedAt: z.date({
    required_error: 'A previsão de chegada é obrigatória',
    invalid_type_error: 'Data inválida',
  }).min(new Date(), 'A data de chegada deve ser no futuro'),
  receiptUrl: z.string({
    required_error: 'O comprovante é obrigatório',
  }).url('URL do comprovante inválida'),
});

export type MarkPurchasedInput = z.infer<typeof markPurchasedSchema>;
