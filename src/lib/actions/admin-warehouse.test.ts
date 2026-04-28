import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrdersInTransit, confirmWarehouseReceipt, getWarehouseInventory, extendStorageDeadline, chargeStorageFee, contactClientAboutItem } from './admin-warehouse';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { sendEmail } from '@/lib/email/service';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    warehouseItem: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    extraService: {
      update: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/utils/audit-logger', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('@/lib/email/service', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Admin Warehouse Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrdersInTransit', () => {
    it('deve buscar pedidos com status IN_TRANSIT_TO_WAREHOUSE', async () => {
      const mockOrders = [{ id: '1', productName: 'Produto 1' }];
      (prisma.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await getOrdersInTransit();

      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'IN_TRANSIT_TO_WAREHOUSE',
        }),
      }));
      expect(result).toEqual(mockOrders);
    });

    it('deve aplicar filtro de busca se fornecido', async () => {
      await getOrdersInTransit('teste');

      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { productName: { contains: 'teste', mode: 'insensitive' } },
            { id: { contains: 'teste', mode: 'insensitive' } },
            { user: { fullName: { contains: 'teste', mode: 'insensitive' } } },
          ],
        }),
      }));
    });
  });

  describe('confirmWarehouseReceipt', () => {
    const mockAdmin = { id: 'admin-1', role: 'ADMIN' };
    const mockOrder = {
      id: 'order-1',
      userId: 'user-1',
      productName: 'Produto Teste',
      status: 'IN_TRANSIT_TO_WAREHOUSE',
      warehouseItem: null,
      user: { email: 'user@example.com', fullName: 'User Test' },
    };
    const mockReceiveData = {
      photos: ['https://example.com/p1.jpg', 'https://example.com/p2.jpg'],
      weightGrams: 1000,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 10,
      location: 'A1-B1',
    };

    beforeEach(() => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
    });

    it('deve confirmar recebimento e criar WarehouseItem', async () => {
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);
      (prisma.warehouseItem.create as any).mockResolvedValue({ id: 'wi-1' });

      const result = await confirmWarehouseReceipt('order-1', mockReceiveData);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'IN_WAREHOUSE' },
      });
      expect(prisma.warehouseItem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          weightGrams: 1000,
        }),
      }));
      expect(logAdminAction).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(result).toEqual({ id: 'wi-1' });
    });

    it('deve atualizar WarehouseItem se ele já existir', async () => {
      const orderWithWI = {
        ...mockOrder,
        warehouseItem: { id: 'wi-1', extraServices: [] },
      };
      (prisma.order.findUnique as any).mockResolvedValue(orderWithWI);
      (prisma.warehouseItem.update as any).mockResolvedValue({ id: 'wi-1' });

      await confirmWarehouseReceipt('order-1', mockReceiveData);

      expect(prisma.warehouseItem.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'wi-1' },
      }));
    });

    it('deve completar Quality Check se solicitado', async () => {
      const orderWithQC = {
        ...mockOrder,
        warehouseItem: {
          id: 'wi-1',
          extraServices: [{ id: 'es-1', type: 'QUALITY_CHECK', status: 'REQUESTED' }]
        },
      };
      (prisma.order.findUnique as any).mockResolvedValue(orderWithQC);
      (prisma.warehouseItem.update as any).mockResolvedValue({ id: 'wi-1' });

      const qcData = { result: 'OK' as const, notes: 'All good' };
      await confirmWarehouseReceipt('order-1', mockReceiveData, qcData);

      expect(prisma.extraService.update).toHaveBeenCalledWith({
        where: { id: 'es-1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          resultNotes: 'All good',
        }),
      });
    });

    it('deve rejeitar se QC solicitado mas não fornecido', async () => {
      const orderWithQC = {
        ...mockOrder,
        warehouseItem: {
          id: 'wi-1',
          extraServices: [{ id: 'es-1', type: 'QUALITY_CHECK', status: 'REQUESTED' }]
        },
      };
      (prisma.order.findUnique as any).mockResolvedValue(orderWithQC);

      await expect(confirmWarehouseReceipt('order-1', mockReceiveData)).rejects.toThrow(
        'Resultado do Quality Check é obrigatório'
      );
    });

    it('deve rejeitar se fotos forem insuficientes', async () => {
      const invalidData = { ...mockReceiveData, photos: ['one-photo.jpg'] };
      await expect(confirmWarehouseReceipt('order-1', invalidData)).rejects.toThrow();
    });
  });

  describe('getWarehouseInventory', () => {
    it('deve retornar itens com total e paginacao', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      (prisma.warehouseItem.findMany as any).mockResolvedValue(mockItems);
      (prisma.warehouseItem.count as any).mockResolvedValue(1);

      const result = await getWarehouseInventory({ page: 1, limit: 10 });
      expect(prisma.warehouseItem.findMany).toHaveBeenCalled();
      expect(prisma.warehouseItem.count).toHaveBeenCalled();
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
    });

    it('deve aplicar filtros corretamente', async () => {
      (prisma.warehouseItem.findMany as any).mockResolvedValue([]);
      (prisma.warehouseItem.count as any).mockResolvedValue(0);

      await getWarehouseInventory({ search: 'teste', status: 'AVAILABLE' });

      expect(prisma.warehouseItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'AVAILABLE',
          OR: expect.any(Array),
        })
      }));
    });
  });

  describe('extendStorageDeadline', () => {
    it('deve prorrogar o prazo corretamente', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      
      const mockItem = { id: 'item-1', freeStorageDeadline: new Date('2023-01-01') };
      (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);
      (prisma.warehouseItem.update as any).mockResolvedValue({ ...mockItem, freeStorageDeadline: new Date('2023-01-11') });

      const result = await extendStorageDeadline('item-1', { days: 10, reason: 'Atraso no cliente' });

      expect(prisma.warehouseItem.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'item-1' },
      }));
      expect(logAdminAction).toHaveBeenCalledWith('admin-1', 'EXTEND_DEADLINE', 'WAREHOUSE_ITEM', 'item-1', expect.any(Object));
      expect(result.freeStorageDeadline).toEqual(new Date('2023-01-11'));
    });
  });

  describe('chargeStorageFee', () => {
    it('deve cobrar taxa manual e deduzir da carteira', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });

      const mockItem = { id: 'item-1', userId: 'user-1', name: 'Teste' };
      const mockWallet = { id: 'wallet-1', userId: 'user-1', balance: 100 };
      (prisma.warehouseItem.findUnique as any).mockResolvedValue(mockItem);
      (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);
      (prisma.transaction.create as any).mockResolvedValue({ id: 'tx-1' });

      await chargeStorageFee('item-1', { amount: 50, reason: 'Taxa extra' });

      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(prisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'wallet-1' },
        data: { balance: { decrement: 50 } },
      }));
      expect(logAdminAction).toHaveBeenCalled();
    });
  });

  describe('contactClientAboutItem', () => {
    it('deve registrar contato ao cliente', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      (prisma.warehouseItem.findUnique as any).mockResolvedValue({ id: 'item-1', user: { email: 'a@a.com' } });

      await contactClientAboutItem('item-1', { subject: 'Aviso', message: 'Mensagem de teste longa o suficiente' });

      expect(logAdminAction).toHaveBeenCalledWith('admin-1', 'CONTACT_CLIENT', 'WAREHOUSE_ITEM', 'item-1', expect.any(Object));
    });
  });
});
