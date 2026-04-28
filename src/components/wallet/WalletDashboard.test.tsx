import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletDashboard } from './WalletDashboard';

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    useToast: () => ({ addToast: vi.fn() }),
  };
});

const mockTransactions = [
  { id: '1', type: 'CREDIT', amount: 100, description: 'Crédito', createdAt: new Date().toISOString() },
  { id: '2', type: 'DEBIT', amount: 50, description: 'Débito', createdAt: new Date().toISOString() },
  { id: '3', type: 'CREDIT', amount: 200, description: 'Crédito 2', createdAt: new Date().toISOString() },
];

describe('WalletDashboard', () => {
  it('deve renderizar o saldo corretamente', () => {
    render(<WalletDashboard balance={500} transactions={[]} userId="user-1" />);
    expect(screen.getByText(/R\$ 500,00/i)).toBeInTheDocument();
  });

  it('deve filtrar transações por tipo', () => {
    render(<WalletDashboard balance={500} transactions={mockTransactions} userId="user-1" />);
    
    // Inicialmente mostra todos (10 é o default visibleCount, aqui temos 3)
    expect(screen.getByText('Crédito')).toBeInTheDocument();
    expect(screen.getByText('Débito')).toBeInTheDocument();

    // Clica em Crédito (Exato para o botão de filtro)
    fireEvent.click(screen.getByRole('button', { name: /^crédito$/i }));
    expect(screen.getByText('Crédito')).toBeInTheDocument();
    expect(screen.queryByText('Débito')).not.toBeInTheDocument();

    // Clica em Débito (Exato)
    fireEvent.click(screen.getByRole('button', { name: /^débito$/i }));
    expect(screen.queryByText('Crédito')).not.toBeInTheDocument();
    expect(screen.getByText('Débito')).toBeInTheDocument();
  });
});
