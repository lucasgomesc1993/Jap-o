import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPendingShipments, markAsShipped, updateShipmentStatus } from './admin-shipments';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { sendEmail } from '@/lib/email/service';
import { ShipmentStatus } from '@prisma/client';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    shipment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    shipmentItem: {
      findMany: vi.fn(),
    },
    warehouseItem: {
      updateMany: vi.fn(),
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

describe('Admin Shipment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPendingShipments', () => {
    it('deve buscar envios com status PREPARING', async () => {
      const mockShipments = [{ id: '1', status: 'PREPARING' }];
      (prisma.shipment.findMany as any).mockResolvedValue(mockShipments);

      const result = await getPendingShipments();

      expect(prisma.shipment.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'PREPARING',
        }),
      }));
      expect(result).toEqual(mockShipments);
    });

    it('deve aplicar filtro de busca se fornecido', async () => {
      await getPendingShipments('teste');

      expect(prisma.shipment.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { id: { contains: 'teste', mode: 'insensitive' } },
            { user: { fullName: { contains: 'teste', mode: 'insensitive' } } },
            { trackingCode: { contains: 'teste', mode: 'insensitive' } },
          ],
        }),
      }));
    });
  });

  describe('markAsShipped', () => {
    const mockAdmin = { id: 'admin-1', role: 'ADMIN' };
    const mockShipment = {
      id: 'ship-1',
      status: 'PREPARING',
      user: { email: 'user@example.com', fullName: 'User Test' },
    };
    const mockData = {
      trackingCode: 'AA123456789JP',
      finalWeightGrams: 2000,
    };

    beforeEach(() => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
    });

    it('deve marcar como enviado e atualizar itens do armazém', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);
      (prisma.shipmentItem.findMany as any).mockResolvedValue([{ warehouseItemId: 'wi-1' }]);
      (prisma.shipment.update as any).mockResolvedValue({ id: 'ship-1', status: 'SHIPPED' });

      const result = await markAsShipped('ship-1', mockData);

      expect(prisma.shipment.update).toHaveBeenCalledWith({
        where: { id: 'ship-1' },
        data: expect.objectContaining({
          status: 'SHIPPED',
          trackingCode: 'AA123456789JP',
          totalWeightGrams: 2000,
        }),
      });
      expect(prisma.warehouseItem.updateMany).toHaveBeenCalled();
      expect(logAdminAction).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(result.status).toBe('SHIPPED');
    });

    it('deve falhar se trackingCode estiver vazio', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);
      
      await expect(markAsShipped('ship-1', { ...mockData, trackingCode: '' })).rejects.toThrow();
    });

    it('deve falhar se o usuário não for admin', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin-1', role: 'CUSTOMER' });
      
      await expect(markAsShipped('ship-1', mockData)).rejects.toThrow('Não autorizado');
    });
  });

  describe('updateShipmentStatus', () => {
    const mockAdmin = { id: 'admin-1', role: 'ADMIN' };
    const mockShipment = {
      id: 'ship-1',
      status: 'SHIPPED',
      trackingCode: 'TRACK123',
      user: { email: 'user@example.com', fullName: 'User Test' },
    };

    beforeEach(() => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
    });

    it('deve atualizar status para IN_TRANSIT se atual for SHIPPED', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);
      (prisma.shipment.update as any).mockResolvedValue({ id: 'ship-1', status: 'IN_TRANSIT' });

      await updateShipmentStatus('ship-1', ShipmentStatus.IN_TRANSIT);

      expect(prisma.shipment.update).toHaveBeenCalledWith({
        where: { id: 'ship-1' },
        data: { status: 'IN_TRANSIT' },
      });
      expect(logAdminAction).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it('deve falhar se tentar pular status', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);

      await expect(updateShipmentStatus('ship-1', ShipmentStatus.IN_BRAZIL)).rejects.toThrow(
        'Não é permitido pular estados'
      );
    });

    it('deve falhar se tentar voltar status', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);

      await expect(updateShipmentStatus('ship-1', ShipmentStatus.PREPARING)).rejects.toThrow(
        'Novo status deve ser posterior ao atual'
      );
    });
  });
});
