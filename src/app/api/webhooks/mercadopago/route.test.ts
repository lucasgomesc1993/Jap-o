import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { mpPayment } from '@/lib/mercadopago/client';
import prisma from '@/lib/prisma/client';
import crypto from 'crypto';

// Mocks
vi.mock('@/lib/mercadopago/client', () => ({
  mpPayment: {
    get: vi.fn(),
  },
}));

vi.mock('@/lib/prisma/client', () => ({
  default: {
    transaction: { findFirst: vi.fn(), create: vi.fn() },
    wallet: { findUnique: vi.fn(), update: vi.fn() },
    order: { update: vi.fn() },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe('Mercado Pago Webhook', () => {
  const secret = 'test-secret';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MP_WEBHOOK_SECRET = secret;
  });

  it('deve retornar 401 se a assinatura for inválida', async () => {
    const id = '12345';
    const requestId = 'req-123';
    const ts = '1600000000';
    const signature = `ts=${ts},v1=wrong_hmac`;

    const req = new Request(`http://localhost/api/webhooks/mercadopago?id=${id}&topic=payment`, {
      method: 'POST',
      headers: {
        'x-signature': signature,
        'x-request-id': requestId,
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(401);
  });

  it('deve processar pagamento aprovado com assinatura válida', async () => {
    const id = '12345';
    const requestId = 'req-123';
    const ts = '1600000000';
    const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    const signature = `ts=${ts},v1=${hmac}`;

    (mpPayment.get as any).mockResolvedValue({
      status: 'approved',
      external_reference: 'WALLET_user-123',
      transaction_amount: 100,
    });
    (prisma.transaction.findFirst as any).mockResolvedValue(null);
    (prisma.wallet.findUnique as any).mockResolvedValue({ id: 'wallet-1', balance: 0 });

    const req = new Request(`http://localhost/api/webhooks/mercadopago?id=${id}&topic=payment`, {
      method: 'POST',
      headers: {
        'x-signature': signature,
        'x-request-id': requestId,
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
    expect(prisma.wallet.update).toHaveBeenCalled();
  });

  it('deve ignorar se o pagamento já foi processado (idempotência)', async () => {
    const id = '12345';
    (prisma.transaction.findFirst as any).mockResolvedValue({ id: 'tx-1' });

    // Sem segredo para pular validação se quiser ou com segredo válido
    const req = new Request(`http://localhost/api/webhooks/mercadopago?id=${id}&topic=payment`, {
      method: 'POST',
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Pagamento já processado');
  });
});
