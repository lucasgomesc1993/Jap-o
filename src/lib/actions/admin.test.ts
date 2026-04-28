import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminStats, getAdminAlerts } from './admin';
import prisma from '@/lib/prisma/client';
import { OrderStatus, WarehouseItemStatus, ShipmentStatus, TicketStatus } from '@prisma/client';

// Mock do Prisma
vi.mock('@/lib/prisma/client', () => ({
  default: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    warehouseItem: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    shipment: {
      count: vi.fn(),
    },
    ticket: {
      count: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn(),
    },
  },
}));

describe('Admin Dashboard Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminStats', () => {
    it('deve retornar estatísticas corretamente', async () => {
      (prisma.order.count as any).mockResolvedValue(10);
      (prisma.warehouseItem.count as any).mockResolvedValue(25);
      (prisma.shipment.count as any).mockResolvedValue(5);
      (prisma.ticket.count as any).mockResolvedValue(3);
      (prisma.transaction.aggregate as any).mockResolvedValue({
        _sum: { amount: 1500.50 }
      });

      const stats = await getAdminStats();

      expect(stats).toEqual({
        pendingPurchases: 10,
        warehouseItems: 25,
        preparingShipments: 5,
        openTickets: 3,
        monthlyRevenue: 1500.50
      });

      expect(prisma.order.count).toHaveBeenCalledWith({
        where: { status: OrderStatus.AWAITING_PURCHASE }
      });
      expect(prisma.warehouseItem.count).toHaveBeenCalled();
      expect(prisma.shipment.count).toHaveBeenCalledWith({
        where: { status: ShipmentStatus.PREPARING }
      });
      expect(prisma.ticket.count).toHaveBeenCalledWith({
        where: { status: TicketStatus.OPEN }
      });
    });

    it('deve retornar 0 se não houver receita', async () => {
      (prisma.order.count as any).mockResolvedValue(0);
      (prisma.warehouseItem.count as any).mockResolvedValue(0);
      (prisma.shipment.count as any).mockResolvedValue(0);
      (prisma.ticket.count as any).mockResolvedValue(0);
      (prisma.transaction.aggregate as any).mockResolvedValue({
        _sum: { amount: null }
      });

      const stats = await getAdminStats();

      expect(stats.monthlyRevenue).toBe(0);
    });
  });

  describe('getAdminAlerts', () => {
    it('deve retornar alertas de armazenamento e pagamentos', async () => {
      const mockStorageExpiring = [
        { id: '1', name: 'Item 1', freeStorageDeadline: new Date(), user: { fullName: 'User 1' } }
      ];
      const mockPendingPayments = [
        { id: '1', productName: 'Prod 1', totalBrl: 100, user: { fullName: 'User 1' } }
      ];

      (prisma.warehouseItem.findMany as any).mockResolvedValue(mockStorageExpiring);
      (prisma.order.findMany as any).mockResolvedValue(mockPendingPayments);

      const alerts = await getAdminAlerts();

      expect(alerts.storageExpiring).toHaveLength(1);
      expect(alerts.pendingPayments).toHaveLength(1);
      expect(prisma.warehouseItem.findMany).toHaveBeenCalled();
      expect(prisma.order.findMany).toHaveBeenCalled();
    });
  });
});
