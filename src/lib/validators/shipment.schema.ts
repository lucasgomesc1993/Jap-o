import { z } from 'zod';

export const shippingMethodSchema = z.enum(['SAL', 'EMS', 'DHL', 'FEDEX'], {
  errorMap: () => ({ message: 'Método de frete inválido' }),
});

export const declaredValueTypeSchema = z.enum(['REAL', 'MANUAL'], {
  errorMap: () => ({ message: 'Tipo de declaração inválido' }),
});

export const shipmentCreateSchema = z.object({
  warehouseItemIds: z.array(z.string()).min(1, 'Selecione pelo menos um item'),
  shippingMethod: shippingMethodSchema,
  addressId: z.string().min(1, 'Endereço é obrigatório'),
  hasInsurance: z.boolean().default(false),
  declaredValueType: declaredValueTypeSchema,
  manualDeclaredValueBrl: z.number().nonnegative('O valor deve ser maior ou igual a zero').optional(),
  disclaimerAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de responsabilidade',
  }),
});

export type ShipmentCreateInput = z.infer<typeof shipmentCreateSchema>;
