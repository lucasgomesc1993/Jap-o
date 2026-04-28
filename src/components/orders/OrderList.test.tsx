import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderList } from './OrderList';

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    useToast: () => ({ addToast: vi.fn() }),
  };
});

vi.mock('@/lib/actions/orders', () => ({
  cancelOrder: vi.fn(),
}));

const mockOrders = [
  {
    id: 'order-1',
    productName: 'Produto Teste',
    productImage: null,
    productUrl: 'https://amazon.co.jp/test',
    status: 'AWAITING_PURCHASE',
    totalBrl: 150.50,
    quantity: 1,
    createdAt: new Date().toISOString(),
    variation: null,
    notes: null,
  },
];

describe('OrderList', () => {
  it('deve renderizar a lista de pedidos e abrir modal de detalhes', () => {
    render(<OrderList orders={mockOrders} />);
    
    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
    
    // Abrir detalhes
    fireEvent.click(screen.getByText(/detalhes/i));
    
    // Verificar se a timeline aparece na modal (Usamos getAll pois o status também pode estar no badge)
    expect(screen.getAllByText('Solicitado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comprado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Armazém').length).toBeGreaterThan(0);
  });
});
