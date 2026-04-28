import { z } from 'zod';

export const warehouseReceiveSchema = z.object({
  photos: z
    .array(z.string().url('URL da foto inválida'))
    .min(2, 'Mínimo de 2 fotos obrigatório')
    .max(3, 'Máximo de 3 fotos permitido'),
  weightGrams: z.number().int().positive('Peso deve ser maior que zero'),
  lengthCm: z.number().int().positive('Comprimento deve ser maior que zero'),
  widthCm: z.number().int().positive('Largura deve ser maior que zero'),
  heightCm: z.number().int().positive('Altura deve ser maior que zero'),
  location: z.string().min(1, 'Localização no armazém é obrigatória'),
});

export type WarehouseReceiveInput = z.infer<typeof warehouseReceiveSchema>;
