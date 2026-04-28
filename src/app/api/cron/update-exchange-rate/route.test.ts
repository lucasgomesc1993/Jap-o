import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { getExchangeRate } from '@/lib/utils/exchange-rate';

vi.mock('@/lib/utils/exchange-rate', () => ({
  getExchangeRate: vi.fn(),
}));

describe('Cron Update Exchange Rate API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  it('deve retornar 401 se o token de autorização estiver incorreto', async () => {
    const req = new NextRequest('http://localhost/api/cron/update-exchange-rate', {
      headers: { authorization: 'Bearer wrong-secret' }
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('deve atualizar a cotação com sucesso quando autorizado', async () => {
    (getExchangeRate as any).mockResolvedValue(0.0350);

    const req = new NextRequest('http://localhost/api/cron/update-exchange-rate', {
      headers: { authorization: 'Bearer test-secret' }
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.rate).toBe(0.0350);
    expect(getExchangeRate).toHaveBeenCalled();
  });

  it('deve retornar 500 se ocorrer um erro na atualização', async () => {
    (getExchangeRate as any).mockRejectedValue(new Error('API Offline'));

    const req = new NextRequest('http://localhost/api/cron/update-exchange-rate', {
      headers: { authorization: 'Bearer test-secret' }
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('API Offline');
  });
});
