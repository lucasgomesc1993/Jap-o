import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { mpPayment } from '@/lib/mercadopago/client';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/mercadopago/client', () => ({
  mpPayment: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('POST /api/payments/pix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 401 se não houver usuário autenticado', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const req = new NextRequest('http://localhost/api/payments/pix', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('deve retornar 422 se o valor for inválido', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } }) },
    });

    const req = new NextRequest('http://localhost/api/payments/pix', {
      method: 'POST',
      body: JSON.stringify({ amount: 0 }),
    });

    const response = await POST(req);
    expect(response.status).toBe(422);
  });

  it('deve gerar cobrança Pix com sucesso', async () => {
    (createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } }) },
    });

    (mpPayment.create as any).mockResolvedValue({
      id: '123456',
      status: 'pending',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'mock-qr-code',
          qr_code_base64: 'mock-base64',
        },
      },
    });

    const req = new NextRequest('http://localhost/api/payments/pix', {
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        description: 'Teste',
        referenceId: 'ref_123',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.paymentId).toBe('123456');
    expect(data.qrCode).toBe('mock-qr-code');
    expect(mpPayment.create).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({
        transaction_amount: 100,
        external_reference: 'ref_123',
      }),
    }));
  });
});
