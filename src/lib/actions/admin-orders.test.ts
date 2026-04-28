import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminAwaitingPurchaseOrders, markOrderAsPurchased, markOrderAsInTransit } from './admin-orders';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';

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
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/utils/audit-logger', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

describe('Admin Orders Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminAwaitingPurchaseOrders', () => {
    it('deve buscar pedidos com status AWAITING_PURCHASE', async () => {
      const mockOrders = [{ id: '1', productName: 'Produto 1' }];
      (prisma.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await getAdminAwaitingPurchaseOrders();

      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['AWAITING_PURCHASE', 'PURCHASED'] },
        }),
      }));
      expect(result).toEqual(mockOrders);
    });

    it('deve aplicar filtro de busca se fornecido', async () => {
      await getAdminAwaitingPurchaseOrders('teste');

      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { productName: { contains: 'teste', mode: 'insensitive' } },
            { user: { fullName: { contains: 'teste', mode: 'insensitive' } } },
          ],
        }),
      }));
    });
  });

  describe('markOrderAsPurchased', () => {
    const mockAdmin = { id: 'admin-1', role: 'ADMIN' };
    const mockData = {
      realPriceJpy: 1500,
      arrivalExpectedAt: new Date(Date.now() + 86400000),
      receiptUrl: 'https://example.com/receipt.jpg',
    };

    it('deve atualizar status do pedido para PURCHASED', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (prisma.order.update as any).mockResolvedValue({ id: 'order-1', status: 'PURCHASED' });

      const result = await markOrderAsPurchased('order-1', mockData);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: 'PURCHASED',
          realPriceJpy: 1500,
        }),
      });
      expect(logAdminAction).toHaveBeenCalled();
      expect(result.status).toBe('PURCHASED');
    });

    it('deve falhar se não for admin', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', role: 'CUSTOMER' });

      await expect(markOrderAsPurchased('order-1', mockData)).rejects.toThrow('Não autorizado');
    });
  });

  describe('markOrderAsInTransit', () => {
    const mockAdmin = { id: 'admin-1', role: 'ADMIN' };

    it('deve atualizar status para IN_TRANSIT_TO_WAREHOUSE', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'PURCHASED' });
      (prisma.order.update as any).mockResolvedValue({ id: 'order-1', status: 'IN_TRANSIT_TO_WAREHOUSE' });

      const result = await markOrderAsInTransit('order-1');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'IN_TRANSIT_TO_WAREHOUSE' },
      });
      expect(logAdminAction).toHaveBeenCalledWith('admin-1', 'MARK_AS_IN_TRANSIT', 'ORDER', 'order-1');
      expect(result.status).toBe('IN_TRANSIT_TO_WAREHOUSE');
    });

    it('deve falhar se o pedido não estiver como PURCHASED', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (prisma.order.findUnique as any).mockResolvedValue({ id: 'order-1', status: 'AWAITING_PURCHASE' });

      await expect(markOrderAsInTransit('order-1')).rejects.toThrow('Pedido deve estar no status COMPRADO');
    });
  });
});
