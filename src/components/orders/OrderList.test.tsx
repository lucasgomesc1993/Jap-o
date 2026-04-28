import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderList } from './OrderList';
import { cancelOrder } from '@/lib/actions/orders';

// Mocks
vi.mock('@/lib/actions/orders', () => ({
  cancelOrder: vi.fn(),
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

// Mock window.confirm
window.confirm = vi.fn(() => true);

const mockOrders = [
  {
    id: '1',
    productName: 'Nintendo Switch',
    productImage: 'http://img.com/nintendo',
    productUrl: 'http://store.com/nintendo',
    status: 'AWAITING_PURCHASE',
    totalBrl: 2000,
    quantity: 1,
    createdAt: '2026-04-28T10:00:00Z',
    variation: 'Neon',
    notes: 'Teste',
  },
  {
    id: '2',
    productName: 'PS5',
    productImage: null,
    productUrl: 'http://store.com/ps5',
    status: 'PURCHASED',
    totalBrl: 4000,
    quantity: 1,
    createdAt: '2026-04-27T10:00:00Z',
    variation: null,
    notes: null,
  }
];

describe('OrderList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a lista de pedidos corretamente', () => {
    render(<OrderList orders={mockOrders} />);
    
    expect(screen.getByText('Nintendo Switch')).toBeDefined();
    expect(screen.getByText('PS5')).toBeDefined();
    // Usamos getAllByText pois o texto aparece no badge e no filtro (select)
    expect(screen.getAllByText('Aguardando Compra').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comprado').length).toBeGreaterThan(0);
  });

  it('deve filtrar pedidos por status', () => {
    render(<OrderList orders={mockOrders} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PURCHASED' } });
    
    expect(screen.queryByText('Nintendo Switch')).toBeNull();
    expect(screen.getByText('PS5')).toBeDefined();
  });

  it('deve abrir o modal de detalhes ao clicar no botão', () => {
    render(<OrderList orders={mockOrders} />);
    
    const detailButtons = screen.getAllByText(/Detalhes/i);
    fireEvent.click(detailButtons[0]);
    
    expect(screen.getByText('Detalhes do Pedido')).toBeDefined();
    expect(screen.getByText('ID: 1')).toBeDefined();
  });

  it('deve permitir cancelar um pedido em status AWAITING_PURCHASE', async () => {
    (cancelOrder as any).mockResolvedValue({ success: true });
    
    render(<OrderList orders={mockOrders} />);
    
    // Abre detalhes
    const detailButtons = screen.getAllByText(/Detalhes/i);
    fireEvent.click(detailButtons[0]);
    
    // Clica em cancelar
    const cancelBtn = screen.getByText(/Cancelar Pedido/i);
    fireEvent.click(cancelBtn);
    
    await waitFor(() => {
      expect(cancelOrder).toHaveBeenCalledWith('1');
    });
    
    // Status deve mudar na UI (mockado via state interno no componente)
    // Buscamos apenas o elemento que contém o texto de status
    expect(screen.getAllByText('Cancelado').length).toBeGreaterThan(0);
  });

  it('exibe empty state quando não há pedidos', () => {
    render(<OrderList orders={[]} />);
    expect(screen.getByText('Nenhum pedido encontrado nesta categoria.')).toBeDefined();
  });
});
