import { z } from 'zod';

export const warehouseItemSchema = z.object({
  name: z.string().min(1, 'Nome do item é obrigatório'),
  weightGrams: z.number().int().positive('Peso deve ser maior que zero'),
  lengthCm: z.number().int().positive('Comprimento deve ser maior que zero'),
  widthCm: z.number().int().positive('Largura deve ser maior que zero'),
  heightCm: z.number().int().positive('Altura deve ser maior que zero'),
});

export type WarehouseItemInput = z.infer<typeof warehouseItemSchema>;
