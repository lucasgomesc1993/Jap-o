import { describe, it, expect } from 'vitest';
import { shipmentCreateSchema } from './shipment.schema';

describe('ShipmentCreateSchema', () => {
  it('deve validar um input de envio válido', () => {
    const validData = {
      warehouseItemIds: ['item-1', 'item-2'],
      shippingMethod: 'EMS',
      addressId: 'addr-1',
      hasInsurance: true,
      declaredValueType: 'REAL',
      disclaimerAccepted: true,
    };

    const result = shipmentCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve falhar se nenhum item for selecionado', () => {
    const invalidData = {
      warehouseItemIds: [],
      shippingMethod: 'EMS',
      addressId: 'addr-1',
      hasInsurance: true,
      declaredValueType: 'REAL',
      disclaimerAccepted: true,
    };

    const result = shipmentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Selecione pelo menos um item');
    }
  });

  it('deve falhar se o método de frete for inválido', () => {
    const invalidData = {
      warehouseItemIds: ['item-1'],
      shippingMethod: 'INVALID',
      addressId: 'addr-1',
      hasInsurance: true,
      declaredValueType: 'REAL',
      disclaimerAccepted: true,
    };

    const result = shipmentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve falhar se os termos não forem aceitos', () => {
    const invalidData = {
      warehouseItemIds: ['item-1'],
      shippingMethod: 'EMS',
      addressId: 'addr-1',
      hasInsurance: true,
      declaredValueType: 'REAL',
      disclaimerAccepted: false,
    };

    const result = shipmentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Você deve aceitar os termos de responsabilidade');
    }
  });

  it('deve validar com valor manual correto', () => {
    const validData = {
      warehouseItemIds: ['item-1'],
      shippingMethod: 'EMS',
      addressId: 'addr-1',
      hasInsurance: false,
      declaredValueType: 'MANUAL',
      manualDeclaredValueBrl: 150.50,
      disclaimerAccepted: true,
    };

    const result = shipmentCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
