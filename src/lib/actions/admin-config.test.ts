import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystemConfig, updateSystemConfig, getAuditLogs } from './admin-config';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';

// Mocks
vi.mock('@/lib/prisma/client', () => ({
  default: {
    systemConfig: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
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

describe('Admin Config Actions', () => {
  const mockAdminUser = { id: 'admin-1', role: 'ADMIN', fullName: 'Admin User' };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (createClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
      },
    });

    (prisma.user.findUnique as any).mockResolvedValue(mockAdminUser);
  });

  describe('getSystemConfig', () => {
    it('deve retornar a configuração existente', async () => {
      const mockConfig = { id: 'CURRENT', serviceFeePercent: 10 };
      (prisma.systemConfig.findUnique as any).mockResolvedValue(mockConfig);

      const result = await getSystemConfig();
      expect(result).toEqual(mockConfig);
    });

    it('deve criar configuração padrão se não existir', async () => {
      (prisma.systemConfig.findUnique as any).mockResolvedValue(null);
      (prisma.systemConfig.create as any).mockResolvedValue({ id: 'CURRENT', serviceFeePercent: 10 });

      await getSystemConfig();
      expect(prisma.systemConfig.create).toHaveBeenCalled();
    });
  });

  describe('updateSystemConfig', () => {
    it('deve atualizar a configuração e criar log de auditoria', async () => {
      const newData = {
        serviceFeePercent: 15,
        fixedFeeBrl: 40,
        freeStorageDays: 30,
        storageFeePerDay: 7,
        jpyExchangeRate: 0.04,
        shippingRates: {
          SAL: [{ min: 0, max: 500, basePrice: 60, pricePerGram: 0.07 }],
          EMS: [], DHL: [], FEDEX: []
        },
        extraServicePrices: {
          EXTRA_PHOTO: 12, QUALITY_CHECK: 25, REMOVE_PACKAGING: 6, EXTRA_PROTECTION: 18
        },
        allowedPlatforms: ['https://amazon.co.jp'],
        prohibitedProducts: ['Álcool']
      };

      (prisma.systemConfig.findUnique as any).mockResolvedValue({ id: 'CURRENT' });
      (prisma.systemConfig.update as any).mockResolvedValue({ ...newData, id: 'CURRENT' });

      const result = await updateSystemConfig(newData);

      expect(prisma.systemConfig.update).toHaveBeenCalled();
      expect(logAdminAction).toHaveBeenCalledWith(
        'admin-1',
        'UPDATE_CONFIG',
        'SYSTEM_CONFIG',
        'CURRENT',
        expect.any(Object)
      );
      expect(result.serviceFeePercent).toBe(15);
    });

    it('deve falhar se os dados forem inválidos', async () => {
      const invalidData = { serviceFeePercent: 150 }; // Max 100

      await expect(updateSystemConfig(invalidData)).rejects.toThrow();
    });
  });

  describe('getAuditLogs', () => {
    it('deve retornar logs paginados', async () => {
      (prisma.auditLog.findMany as any).mockResolvedValue([{ id: 'log-1' }]);
      (prisma.auditLog.count as any).mockResolvedValue(1);

      const result = await getAuditLogs(1, 10);

      expect(result.logs).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });
  });
});
