import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getShipments, getShipmentDetail, confirmShipmentDelivery } from './shipment-details';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { ShipmentStatus } from '@prisma/client';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock do Prisma
vi.mock('@/lib/prisma/client', () => ({
  default: {
    shipment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock do revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Shipment Details Actions', () => {
  const mockUser = { id: 'user-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
  });

  describe('getShipments', () => {
    it('deve retornar a lista de envios do usuário', async () => {
      const mockShipments = [
        { id: 'ship-1', userId: 'user-1', status: 'PREPARING' },
        { id: 'ship-2', userId: 'user-1', status: 'SHIPPED' },
      ];
      (prisma.shipment.findMany as any).mockResolvedValue(mockShipments);

      const result = await getShipments();

      expect(result).toEqual(mockShipments);
      expect(prisma.shipment.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: mockUser.id }
      }));
    });

    it('deve lançar erro se o usuário não estiver autenticado', async () => {
      (createClient as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      });

      await expect(getShipments()).rejects.toThrow('Usuário não autenticado');
    });
  });

  describe('getShipmentDetail', () => {
    it('deve retornar os detalhes de um envio', async () => {
      const mockShipment = { id: 'ship-1', userId: 'user-1', status: 'PREPARING' };
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);

      const result = await getShipmentDetail('ship-1');

      expect(result).toEqual(mockShipment);
      expect(prisma.shipment.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'ship-1', userId: 'user-1' }
      }));
    });

    it('deve lançar erro se o envio não for encontrado', async () => {
      (prisma.shipment.findUnique as any).mockResolvedValue(null);

      await expect(getShipmentDetail('non-existent')).rejects.toThrow('Envio não encontrado');
    });
  });

  describe('confirmShipmentDelivery', () => {
    it('deve atualizar o status para DELIVERED se estiver OUT_FOR_DELIVERY', async () => {
      const mockShipment = { id: 'ship-1', userId: 'user-1', status: ShipmentStatus.OUT_FOR_DELIVERY };
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);

      const result = await confirmShipmentDelivery('ship-1');

      expect(result).toEqual({ success: true });
      expect(prisma.shipment.update).toHaveBeenCalledWith({
        where: { id: 'ship-1' },
        data: { status: ShipmentStatus.DELIVERED }
      });
    });

    it('deve retornar erro se o status não for OUT_FOR_DELIVERY', async () => {
      const mockShipment = { id: 'ship-1', userId: 'user-1', status: ShipmentStatus.SHIPPED };
      (prisma.shipment.findUnique as any).mockResolvedValue(mockShipment);

      const result = await confirmShipmentDelivery('ship-1');

      expect(result.error).toContain('só pode ser confirmado quando estiver em rota de entrega');
      expect(prisma.shipment.update).not.toHaveBeenCalled();
    });
  });
});
