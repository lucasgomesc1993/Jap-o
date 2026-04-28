import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { scrapeProduct } from '@/lib/scraper';

vi.mock('@/lib/scraper', () => ({
  scrapeProduct: vi.fn(),
}));

describe('POST /api/scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 400 se a URL não for enviada', async () => {
    const req = new NextRequest('http://localhost/api/scraper', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('URL é obrigatória');
  });

  it('deve retornar dados do produto com sucesso', async () => {
    const mockProduct = {
      name: 'Item Teste',
      priceJpy: 1000,
      image: 'http://image.com',
    };
    (scrapeProduct as any).mockResolvedValue(mockProduct);

    const req = new NextRequest('http://localhost/api/scraper', {
      method: 'POST',
      body: JSON.stringify({ url: 'http://amazon.co.jp/p1' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockProduct);
  });

  it('deve retornar 422 para plataforma não suportada', async () => {
    (scrapeProduct as any).mockRejectedValue(new Error('Plataforma não suportada'));

    const req = new NextRequest('http://localhost/api/scraper', {
      method: 'POST',
      body: JSON.stringify({ url: 'http://invalid.com' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(422);
  });
});
