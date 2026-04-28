import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { mpPayment } from '@/lib/mercadopago/client';
import prisma from '@/lib/prisma/client';

vi.mock('@/lib/mercadopago/client', () => ({
  mpPayment: {
    get: vi.fn(),
  },
}));

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    transaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(null)), // Será ajustado no teste
  }
}));

// Ajuste para o $transaction usar o próprio mockPrisma
(mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(mockPrisma));

vi.mock('@/lib/prisma/client', () => ({
  default: mockPrisma,
}));

describe('POST /api/webhooks/mercadopago', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve processar recarga de carteira aprovada', async () => {
    (mpPayment.get as any).mockResolvedValue({
      status: 'approved',
      transaction_amount: 50,
      external_reference: 'WALLET_user123',
    });

    (prisma.transaction.findFirst as any).mockResolvedValue(null);
    (prisma.wallet.findUnique as any).mockResolvedValue({ id: 'wallet_123', userId: 'user123' });

    const req = new NextRequest('http://localhost/api/webhooks/mercadopago?topic=payment&id=999', {
      method: 'POST',
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(prisma.wallet.update).toHaveBeenCalled();
  });

  it('deve ignorar pagamento já processado (idempotência)', async () => {
    (mpPayment.get as any).mockResolvedValue({
      status: 'approved',
      transaction_amount: 50,
      external_reference: 'WALLET_user123',
    });

    (prisma.transaction.findFirst as any).mockResolvedValue({ id: 'existing' });

    const req = new NextRequest('http://localhost/api/webhooks/mercadopago?topic=payment&id=999', {
      method: 'POST',
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe('Pagamento já processado');
    expect(prisma.wallet.update).not.toHaveBeenCalled();
  });

  it('deve processar aprovação de pedido', async () => {
    (mpPayment.get as any).mockResolvedValue({
      status: 'approved',
      transaction_amount: 100,
      external_reference: 'ORDER_abc-123',
    });

    (prisma.transaction.findFirst as any).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/webhooks/mercadopago?topic=payment&id=888', {
      method: 'POST',
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'abc-123' },
      data: { status: 'AWAITING_PURCHASE' }
    }));
  });
});
