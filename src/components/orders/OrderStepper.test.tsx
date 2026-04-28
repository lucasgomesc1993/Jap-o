import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderStepper } from './OrderStepper';
import { createOrder } from '@/lib/actions/orders';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/setup';

// Mocks
vi.mock('@/lib/actions/orders', () => ({
  createOrder: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useToast: () => ({
      addToast: vi.fn(),
    }),
  };
});

describe('OrderStepper Component', () => {
  const rate = 0.04;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o passo 1 inicialmente', () => {
    render(<OrderStepper initialExchangeRate={rate} />);
    expect(screen.getByText('Coloque o Link')).toBeDefined();
  });

  it('deve avançar para o passo 2 após o scraping bem-sucedido', async () => {
    server.use(
      http.post('/api/scraper', () => {
        return HttpResponse.json({
          name: 'Item Scraping',
          priceJpy: 1000,
          image: 'http://img.com',
        });
      })
    );

    render(<OrderStepper initialExchangeRate={rate} />);
    
    const input = screen.getByLabelText('URL do Produto');
    fireEvent.change(input, { target: { value: 'https://amazon.co.jp/test' } });
    
    const btn = screen.getByText('Buscar Produto');
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(screen.getByText('Confirme os Dados')).toBeDefined();
    });
    
    expect(screen.getByDisplayValue('Item Scraping')).toBeDefined();
  });

  it('deve calcular os custos corretamente no passo 3', async () => {
    server.use(
      http.post('/api/scraper', () => {
        return HttpResponse.json({
          name: 'Item',
          priceJpy: 1000,
          image: 'http://img.com',
        });
      })
    );

    render(<OrderStepper initialExchangeRate={rate} />);
    
    fireEvent.change(screen.getByLabelText('URL do Produto'), { target: { value: 'x' } });
    fireEvent.click(screen.getByText('Buscar Produto'));
    
    await waitFor(() => screen.getByText('Confirme os Dados'));
    fireEvent.click(screen.getByText('Próximo Passo'));
    
    await waitFor(() => screen.getByText('Resumo de Custos'));
    
    expect(screen.getByText('R$ 40.00')).toBeDefined();
    expect(screen.getByText('R$ 64.00')).toBeDefined();
  });

  it('deve chamar createOrder ao finalizar no passo 4', async () => {
    server.use(
      http.post('/api/scraper', () => {
        return HttpResponse.json({ name: 'x', priceJpy: 1000 });
      })
    );
    (createOrder as any).mockResolvedValue({ success: true });

    render(<OrderStepper initialExchangeRate={rate} />);
    
    fireEvent.change(screen.getByLabelText('URL do Produto'), { target: { value: 'x' } });
    fireEvent.click(screen.getByText('Buscar Produto'));
    await waitFor(() => screen.getByText('Confirme os Dados'));
    fireEvent.click(screen.getByText('Próximo Passo'));
    await waitFor(() => screen.getByText('Resumo de Custos'));
    fireEvent.click(screen.getByText('Ir para Pagamento'));
    await waitFor(() => screen.getByText('Pagamento'));
    
    fireEvent.click(screen.getByText('Finalizar Pedido'));
    
    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled();
    });
  });
});
