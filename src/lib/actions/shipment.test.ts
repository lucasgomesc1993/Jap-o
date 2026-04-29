import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShipment } from './warehouse';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { ShippingMethod, DeclaredValueType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock do Prisma
vi.mock('@/lib/prisma/client', () => ({
  default: {
    $transaction: vi.fn((cb) => cb(prisma)),
    warehouseItem: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    shipment: {
      create: vi.fn(),
    },
    shipmentItem: {
      createMany: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    systemConfig: {
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  },
}));

// Mock do revalidatePath e headers
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('127.0.0.1'),
  }),
}));

describe('createShipment', () => {
  const mockUser = { id: 'user-1' };
  const mockWarehouseItemIds = ['item-1', 'item-2'];

  beforeEach(() => {
    vi.clearAllMocks();
    
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
  });

  it('deve criar um envio com sucesso e debitar carteira', async () => {
    const mockItems = [
      { id: 'item-1', userId: 'user-1', weightGrams: 200, status: 'AVAILABLE', name: 'Item 1' },
      { id: 'item-2', userId: 'user-1', weightGrams: 300, status: 'AVAILABLE', name: 'Item 2' },
    ];
    const mockWallet = { id: 'wallet-1', balance: new Decimal(500) };
    const mockShipment = { id: 'shipment-1' };

    (prisma.warehouseItem.findMany as any).mockResolvedValue(mockItems);
    (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);
    (prisma.shipment.create as any).mockResolvedValue(mockShipment);

    const input = {
      warehouseItemIds: mockWarehouseItemIds,
      shippingMethod: 'EMS' as ShippingMethod,
      addressId: 'addr-1',
      hasInsurance: true,
      declaredValueType: 'MANUAL' as DeclaredValueType,
      manualDeclaredValueBrl: 100,
      disclaimerAccepted: true,
    };

    const result = await createShipment(input);

    expect(result).toEqual({ success: true, shipmentId: 'shipment-1' });
    
    // Verificações
    expect(prisma.shipment.create).toHaveBeenCalled();
    expect(prisma.warehouseItem.updateMany).toHaveBeenCalledWith({
      where: { id: { in: mockWarehouseItemIds } },
      data: { status: 'SELECTED_FOR_SHIPMENT' },
    });
    
    // Peso total: 500g. EMS 500g = R$ 160. Seguro 2% de 100 = R$ 2. Total = R$ 162.
    expect(prisma.wallet.update).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      data: { balance: { decrement: 162 } },
    });
  });

  it('deve retornar erro se o saldo for insuficiente', async () => {
    const mockItems = [
      { id: 'item-1', userId: 'user-1', weightGrams: 200, status: 'AVAILABLE', name: 'Item 1' },
    ];
    const mockWallet = { id: 'wallet-1', balance: new Decimal(50) }; // Frete EMS 500g é 160

    (prisma.warehouseItem.findMany as any).mockResolvedValue(mockItems);
    (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);

    const input = {
      warehouseItemIds: ['item-1'],
      shippingMethod: 'EMS' as ShippingMethod,
      addressId: 'addr-1',
      hasInsurance: false,
      declaredValueType: 'REAL' as DeclaredValueType,
      disclaimerAccepted: true,
    };

    const result = await createShipment(input);

    expect(result.error).toContain('Saldo insuficiente');
    expect(prisma.shipment.create).not.toHaveBeenCalled();
  });

  it('deve retornar erro se algum item não estiver disponível', async () => {
    const mockItems = [
      { id: 'item-1', userId: 'user-1', weightGrams: 200, status: 'SHIPPED', name: 'Item 1' },
    ];

    (prisma.warehouseItem.findMany as any).mockResolvedValue(mockItems);

    const input = {
      warehouseItemIds: ['item-1'],
      shippingMethod: 'EMS' as ShippingMethod,
      addressId: 'addr-1',
      hasInsurance: false,
      declaredValueType: 'REAL' as DeclaredValueType,
      disclaimerAccepted: true,
    };

    const result = await createShipment(input);

    expect(result.error).toContain('não está disponível para envio');
  });
});
