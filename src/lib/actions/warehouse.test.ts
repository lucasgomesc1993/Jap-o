import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestExtraService } from './warehouse';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { ExtraServiceType } from '@prisma/client';
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
      findUnique: vi.fn(),
    },
    extraService: {
      findFirst: vi.fn(),
      create: vi.fn(),
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

// Mock do revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('requestExtraService', () => {
  const mockUser = { id: 'user-1' };
  const mockWarehouseItemId = '550e8400-e29b-41d1-a511-444665544000';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock for createClient
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
  });

  it('deve retornar erro se o usuário não estiver autenticado', async () => {
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const result = await requestExtraService({
      warehouseItemId: mockWarehouseItemId,
      type: ExtraServiceType.EXTRA_PHOTO,
    });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
  });

  it('deve solicitar serviço extra com sucesso e debitar carteira', async () => {
    const mockItem = { id: mockWarehouseItemId, userId: 'user-1', name: 'Item Teste' };
    const mockWallet = { id: 'wallet-1', balance: new Decimal(100) };
    const mockCreatedService = { id: 'service-1' };

    (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);
    (prisma.extraService.findFirst as any).mockResolvedValue(null);
    (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);
    (prisma.extraService.create as any).mockResolvedValue(mockCreatedService);

    const result = await requestExtraService({
      warehouseItemId: mockWarehouseItemId,
      type: ExtraServiceType.EXTRA_PHOTO,
    });

    expect(result).toEqual({ success: true });
    expect(prisma.extraService.create).toHaveBeenCalled();
    expect(prisma.wallet.update).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      data: { balance: { decrement: 5 } },
    });
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('deve retornar erro se o saldo for insuficiente', async () => {
    const mockItem = { id: mockWarehouseItemId, userId: 'user-1', name: 'Item Teste' };
    const mockWallet = { id: 'wallet-1', balance: new Decimal(2) }; // Menor que 5

    (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);
    (prisma.extraService.findFirst as any).mockResolvedValue(null);
    (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);

    const result = await requestExtraService({
      warehouseItemId: mockWarehouseItemId,
      type: ExtraServiceType.EXTRA_PHOTO,
    });

    expect(result).toEqual({ error: 'Saldo insuficiente na carteira' });
    expect(prisma.extraService.create).not.toHaveBeenCalled();
  });

  it('deve retornar erro se o serviço já foi solicitado', async () => {
    const mockItem = { id: mockWarehouseItemId, userId: 'user-1', name: 'Item Teste' };
    const mockExistingService = { id: 'service-1' };

    (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);
    (prisma.extraService.findFirst as any).mockResolvedValue(mockExistingService);

    const result = await requestExtraService({
      warehouseItemId: mockWarehouseItemId,
      type: ExtraServiceType.EXTRA_PHOTO,
    });

    expect(result.error).toContain('já foi solicitado');
    expect(prisma.extraService.create).not.toHaveBeenCalled();
  });

  it('deve retornar erro se o item não pertencer ao usuário', async () => {
    const mockItem = { id: mockWarehouseItemId, userId: 'other-user', name: 'Item Alheio' };

    (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);

    const result = await requestExtraService({
      warehouseItemId: mockWarehouseItemId,
      type: ExtraServiceType.EXTRA_PHOTO,
    });

    expect(result).toEqual({ error: 'Você não tem permissão para solicitar serviços para este item' });
  });
});
