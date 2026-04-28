import { describe, it, expect } from 'vitest';
import { extraServiceSchema } from './extra-service.schema';
import { ExtraServiceType } from '@prisma/client';

describe('extraServiceSchema', () => {
  it('deve validar um input correto', () => {
    const input = {
      warehouseItemId: '550e8400-e29b-41d1-a511-444665544000',
      type: ExtraServiceType.EXTRA_PHOTO,
    };
    const result = extraServiceSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('deve falhar se warehouseItemId não for um UUID', () => {
    const input = {
      warehouseItemId: 'invalid-id',
      type: ExtraServiceType.EXTRA_PHOTO,
    };
    const result = extraServiceSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('ID do item inválido');
    }
  });

  it('deve falhar se type for inválido', () => {
    const input = {
      warehouseItemId: '550e8400-e29b-41d1-a511-444665544000',
      type: 'INVALID_TYPE',
    };
    const result = extraServiceSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Tipo de serviço inválido');
    }
  });

  it('deve falhar se warehouseItemId estiver ausente', () => {
    const input = {
      type: ExtraServiceType.EXTRA_PHOTO,
    };
    const result = extraServiceSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('ID do item é obrigatório');
    }
  });
});
