import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFinancialReport } from './admin-finance';
import prisma from '@/lib/prisma/client';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    order: {
      findMany: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    shipment: {
      findMany: vi.fn(),
    },
    systemConfig: {
      findUnique: vi.fn(),
    },
    operationalCost: {
      findMany: vi.fn(),
    },
    wallet: {
      findMany: vi.fn(),
    },
  },
}));

describe('Admin Finance Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate revenue and costs correctly', async () => {
    // Mock Orders
    (prisma.order.findMany as any).mockResolvedValueOnce([
      { serviceFee: 10, fixedFee: 30 },
      { serviceFee: 20, fixedFee: 30 },
    ]); // Revenue orders

    (prisma.order.findMany as any).mockResolvedValueOnce([
      { realPriceJpy: 1000 },
    ]); // Cost orders

    // Mock Transactions
    (prisma.transaction.aggregate as any).mockResolvedValueOnce({ _sum: { amount: 50 } }); // Extra services
    (prisma.transaction.aggregate as any).mockResolvedValueOnce({ _sum: { amount: 20 } }); // Storage fees

    // Mock Shipments
    (prisma.shipment.findMany as any).mockResolvedValue([
      { shippingCostBrl: 200, realShippingCostBrl: 150 },
    ]);

    // Mock Config
    (prisma.systemConfig.findUnique as any).mockResolvedValue({ jpyExchangeRate: 0.04 });

    // Mock Operational Costs
    (prisma.operationalCost.findMany as any).mockResolvedValue([
      { amount: 100 },
    ]);

    // Mock Wallets
    (prisma.wallet.findMany as any).mockResolvedValue([
      { balance: 500, user: { fullName: 'User 1' } },
    ]);

    (prisma.transaction.groupBy as any).mockResolvedValue([]);

    const report = await getFinancialReport({});

    // Calculations:
    // Revenue:
    // Service fees: (10+30) + (20+30) = 90
    // Extra services: 50
    // Storage: 20
    // Freight Margin: 200 - 150 = 50
    // Total Revenue: 90 + 50 + 20 + 50 = 210

    // Costs:
    // Real purchases: 1000 * 0.04 = 40
    // Real freight: 150
    // Operational: 100
    // Total Costs: 40 + 150 + 100 = 290

    // Net Profit: 210 - 290 = -80

    expect(report.revenue.total).toBe(210);
    expect(report.costs.total).toBe(290);
    expect(report.netProfit).toBe(-80);
    expect(report.liabilities.totalWalletBalance).toBe(500);
  });

  it('should apply date filters correctly', async () => {
    const filter = {
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-31'),
    };

    (prisma.order.findMany as any).mockResolvedValue([]);
    (prisma.transaction.aggregate as any).mockResolvedValue({ _sum: { amount: 0 } });
    (prisma.shipment.findMany as any).mockResolvedValue([]);
    (prisma.systemConfig.findUnique as any).mockResolvedValue(null);
    (prisma.operationalCost.findMany as any).mockResolvedValue([]);
    (prisma.wallet.findMany as any).mockResolvedValue([]);
    (prisma.transaction.groupBy as any).mockResolvedValue([]);

    await getFinancialReport(filter);

    // Verify filter application
    expect(prisma.transaction.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        createdAt: expect.objectContaining({
          gte: expect.any(Date),
          lte: expect.any(Date),
        })
      })
    }));

    expect(prisma.operationalCost.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        date: expect.objectContaining({
          gte: expect.any(Date),
          lte: expect.any(Date),
        })
      })
    }));
  });
});
