import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExchangeRate } from './exchange-rate';
import prisma from '@/lib/prisma/client';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/setup';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    exchangeRate: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    }
  }
}));

describe('Exchange Rate Utility', () => {
  const mockResponse = {
    JPYBRL: {
      bid: '0.0345'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar a cotação do cache se existir para hoje', async () => {
    const mockRate = { date: new Date(), jpyToBrl: 0.0350 };
    (prisma.exchangeRate.findUnique as any).mockResolvedValue(mockRate);

    const rate = await getExchangeRate();

    expect(rate).toBe(0.0350);
    expect(prisma.exchangeRate.findUnique).toHaveBeenCalled();
  });

  it('deve buscar na API se não houver cache e salvar no banco', async () => {
    (prisma.exchangeRate.findUnique as any).mockResolvedValue(null);
    
    server.use(
      http.get('https://economia.awesomeapi.com.br/json/last/JPY-BRL', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    const rate = await getExchangeRate();

    expect(rate).toBe(0.0345);
    expect(prisma.exchangeRate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ jpyToBrl: 0.0345 })
      })
    );
  });

  it('deve usar o fallback da última cotação se a API falhar', async () => {
    (prisma.exchangeRate.findUnique as any).mockResolvedValue(null);
    
    server.use(
      http.get('https://economia.awesomeapi.com.br/json/last/JPY-BRL', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const mockLastRate = { date: new Date(), jpyToBrl: 0.0340 };
    (prisma.exchangeRate.findFirst as any).mockResolvedValue(mockLastRate);

    const rate = await getExchangeRate();

    expect(rate).toBe(0.0340);
    expect(prisma.exchangeRate.findFirst).toHaveBeenCalled();
  });

  it('deve retornar o valor default se API e DB falharem', async () => {
    (prisma.exchangeRate.findUnique as any).mockResolvedValue(null);
    (prisma.exchangeRate.findFirst as any).mockResolvedValue(null);
    
    server.use(
      http.get('https://economia.awesomeapi.com.br/json/last/JPY-BRL', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const rate = await getExchangeRate();
    expect(rate).toBe(0.04);
  });

  it('deve lidar com erro ao salvar no banco sem interromper o fluxo', async () => {
    (prisma.exchangeRate.findUnique as any).mockResolvedValue(null);
    (prisma.exchangeRate.upsert as any).mockRejectedValue(new Error('DB Error'));
    
    server.use(
      http.get('https://economia.awesomeapi.com.br/json/last/JPY-BRL', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    const rate = await getExchangeRate();
    expect(rate).toBe(0.0345);
    expect(prisma.exchangeRate.upsert).toHaveBeenCalled();
  });

  it('deve converter JPY para BRL corretamente', async () => {
    (prisma.exchangeRate.findUnique as any).mockResolvedValue({ jpyToBrl: 0.04 });
    const { convertJpyToBrl } = await import('./exchange-rate');
    const result = await convertJpyToBrl(100);
    expect(result.amountBrl).toBe(4);
    expect(result.rate).toBe(0.04);
  });
});
