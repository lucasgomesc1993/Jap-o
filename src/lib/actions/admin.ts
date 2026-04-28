import prisma from '@/lib/prisma/client';
import { startOfMonth, addDays } from 'date-fns';
import { OrderStatus, WarehouseItemStatus, ShipmentStatus, TicketStatus } from '@prisma/client';

export async function getAdminStats() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    pendingPurchases,
    warehouseItems,
    preparingShipments,
    openTickets,
    monthlyRevenue
  ] = await Promise.all([
    prisma.order.count({
      where: { status: OrderStatus.AWAITING_PURCHASE }
    }),
    prisma.warehouseItem.count({
      where: { 
        status: { 
          in: [WarehouseItemStatus.AVAILABLE, WarehouseItemStatus.SELECTED_FOR_SHIPMENT] 
        } 
      }
    }),
    prisma.shipment.count({
      where: { status: ShipmentStatus.PREPARING }
    }),
    prisma.ticket.count({
      where: { status: TicketStatus.OPEN }
    }),
    prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: { gte: monthStart },
        type: {
          in: [
            'ORDER_PAYMENT',
            'SHIPPING_PAYMENT',
            'EXTRA_SERVICE',
            'STORAGE_FEE'
          ]
        }
      }
    })
  ]);

  return {
    pendingPurchases,
    warehouseItems,
    preparingShipments,
    openTickets,
    monthlyRevenue: Number(monthlyRevenue._sum.amount || 0)
  };
}

export async function getAdminAlerts() {
  const now = new Date();
  const sevenDaysFromNow = addDays(now, 7);

  const [storageExpiring, pendingPayments] = await Promise.all([
    prisma.warehouseItem.findMany({
      where: {
        status: WarehouseItemStatus.AVAILABLE,
        freeStorageDeadline: {
          lt: sevenDaysFromNow
        }
      },
      select: {
        id: true,
        name: true,
        freeStorageDeadline: true,
        user: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        freeStorageDeadline: 'asc'
      }
    }),
    prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING_PAYMENT
      },
      select: {
        id: true,
        productName: true,
        totalBrl: true,
        user: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ]);

  return {
    storageExpiring,
    pendingPayments
  };
}
