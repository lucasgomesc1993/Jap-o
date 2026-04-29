import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerList } from './CustomerList';
import * as actions from '@/lib/actions/admin-customers';

vi.mock('@/lib/actions/admin-customers', () => ({
  getAdminCustomers: vi.fn(),
}));

vi.mock('@/stores/toast.store', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CustomerList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a lista de clientes', async () => {
    const mockData = {
      customers: [
        {
          id: '1',
          fullName: 'Test Customer',
          email: 'test@example.com',
          blocked: false,
          wallet: { balance: 100 },
          _count: { orders: 5, tickets: 2 },
        },
      ],
      pagination: { pages: 1, total: 1, currentPage: 1 },
    };

    (actions.getAdminCustomers as any).mockResolvedValue(mockData);

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    });
  });

  it('deve buscar clientes ao digitar no input', async () => {
    (actions.getAdminCustomers as any).mockResolvedValue({
      customers: [],
      pagination: { pages: 1, total: 0, currentPage: 1 },
    });

    render(<CustomerList />);

    const searchInput = screen.getByPlaceholderText('Buscar por nome ou email...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(actions.getAdminCustomers).toHaveBeenCalledWith(1, 'John');
    });
  });

  it('deve exibir mensagem quando não houver clientes', async () => {
    (actions.getAdminCustomers as any).mockResolvedValue({
      customers: [],
      pagination: { pages: 1, total: 0, currentPage: 1 },
    });

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum cliente encontrado.')).toBeInTheDocument();
    });
  });
});
