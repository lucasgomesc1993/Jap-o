import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerDetails } from './CustomerDetails';
import * as actions from '@/lib/actions/admin-customers';

vi.mock('@/lib/actions/admin-customers', () => ({
  executeManualTransaction: vi.fn(),
  toggleUserBlock: vi.fn(),
}));

vi.mock('@/stores/toast.store', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CustomerDetails Component', () => {
  const mockCustomer = {
    id: 'customer-123',
    fullName: 'John Doe',
    email: 'john@example.com',
    cpf: '12345678901',
    phone: '11988887777',
    blocked: false,
    createdAt: new Date(),
    wallet: { balance: 100 },
    orders: [{ id: 'o1', productName: 'Order 1', totalBrl: 50, status: 'AWAITING_PURCHASE', createdAt: new Date() }],
    shipments: [],
    tickets: [],
    addresses: [{ id: 'a1', label: 'Home', street: 'Street', number: '123', neighborhood: 'Nb', city: 'City', state: 'SP', isDefault: true }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar dados do cliente e CPF mascarado', () => {
    render(<CustomerDetails customer={mockCustomer} adminId="admin-1" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    // CPF mascarado: 123.***.**9-01
    expect(screen.getByText(/123\.\*\*\*\.\*\*9-01/)).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('deve alternar abas', () => {
    render(<CustomerDetails customer={mockCustomer} adminId="admin-1" />);
    
    const shipmentsTab = screen.getByText(/Envios/);
    fireEvent.click(shipmentsTab);
    
    expect(screen.getByText('Nenhum envio encontrado.')).toBeInTheDocument();
  });

  it('deve executar crédito manual', async () => {
    (actions.executeManualTransaction as any).mockResolvedValue({ id: 't1' });
    
    render(<CustomerDetails customer={mockCustomer} adminId="admin-1" />);
    
    const amountInput = screen.getByPlaceholderText('Valor (R$)');
    const reasonInput = screen.getByPlaceholderText('Motivo da transação');
    const submitBtn = screen.getByText('Executar Crédito');
    
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.change(reasonInput, { target: { value: 'Bônus' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(actions.executeManualTransaction).toHaveBeenCalledWith(
        'admin-1',
        'customer-123',
        { type: 'MANUAL_CREDIT', amount: 50, reason: 'Bônus' }
      );
    });
  });

  it('deve bloquear/desbloquear usuário', async () => {
    (actions.toggleUserBlock as any).mockResolvedValue({ id: 'customer-123', blocked: true });
    
    render(<CustomerDetails customer={mockCustomer} adminId="admin-1" />);
    
    const blockBtn = screen.getByText('Bloquear Conta');
    fireEvent.click(blockBtn);
    
    await waitFor(() => {
      expect(actions.toggleUserBlock).toHaveBeenCalledWith('admin-1', 'customer-123');
      expect(screen.getByText('Desbloquear Conta')).toBeInTheDocument();
    });
  });
});
