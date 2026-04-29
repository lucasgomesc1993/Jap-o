import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAdminCustomers, 
  getAdminCustomerDetails, 
  executeManualTransaction, 
  toggleUserBlock 
} from './admin-customers';
import prisma from '@/lib/prisma/client';
import { logAdminAction } from '@/lib/utils/audit-logger';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

vi.mock('@/lib/utils/audit-logger', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('admin-customers actions', () => {
  const adminId = 'admin-123';
  const customerId = 'customer-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminCustomers', () => {
    it('deve retornar lista de clientes com paginação', async () => {
      const mockCustomers = [
        { id: '1', fullName: 'John Doe', wallet: { balance: 100 }, _count: { orders: 1, tickets: 0 } }
      ];
      (prisma.user.findMany as any).mockResolvedValue(mockCustomers);
      (prisma.user.count as any).mockResolvedValue(1);

      const result = await getAdminCustomers(1, 'John');

      expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          OR: [
            { fullName: { contains: 'John', mode: 'insensitive' } },
            { email: { contains: 'John', mode: 'insensitive' } }
          ]
        }
      }));
      expect(result.customers).toEqual(mockCustomers);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('executeManualTransaction', () => {
    it('deve executar crédito manual com sucesso', async () => {
      const formData = {
        type: 'MANUAL_CREDIT',
        amount: 50,
        reason: 'Crédito teste',
      };

      (prisma.wallet.findUnique as any).mockResolvedValue({ 
        id: 'w1', 
        userId: customerId, 
        balance: { lessThan: () => false } 
      });
      (prisma.transaction.create as any).mockResolvedValue({ id: 't1' });

      await executeManualTransaction(adminId, customerId, formData);

      expect(prisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'w1' },
        data: { balance: { increment: 50 } }
      }));
      expect(logAdminAction).toHaveBeenCalledWith(
        adminId,
        'MANUAL_CREDIT',
        'USER',
        customerId,
        expect.objectContaining({ amount: 50 })
      );
    });

    it('deve falhar se débito negativar conta', async () => {
      const formData = {
        type: 'MANUAL_DEBIT',
        amount: 100,
        reason: 'Débito teste',
      };

      (prisma.wallet.findUnique as any).mockResolvedValue({ 
        id: 'w1', 
        userId: customerId, 
        balance: { lessThan: (amt: number) => 50 < amt } 
      });

      await expect(executeManualTransaction(adminId, customerId, formData))
        .rejects.toThrow('Saldo insuficiente para débito');
    });
  });

  describe('toggleUserBlock', () => {
    it('deve alternar status de bloqueio do usuário', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: customerId, blocked: false });
      (prisma.user.update as any).mockResolvedValue({ id: customerId, blocked: true });

      const result = await toggleUserBlock(adminId, customerId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: { blocked: true }
      });
      expect(logAdminAction).toHaveBeenCalledWith(
        adminId,
        'BLOCK_USER',
        'USER',
        customerId,
        expect.any(Object)
      );
      expect(result.blocked).toBe(true);
    });
  });
});
