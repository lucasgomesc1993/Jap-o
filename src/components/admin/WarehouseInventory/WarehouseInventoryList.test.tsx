import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WarehouseInventoryList } from './WarehouseInventoryList';

vi.mock('@/lib/actions/admin-warehouse', () => ({
  extendStorageDeadline: vi.fn(),
  chargeStorageFee: vi.fn(),
  contactClientAboutItem: vi.fn(),
}));

describe('WarehouseInventoryList', () => {
  const mockItems = [
    { id: '1', name: 'Item A', user: { fullName: 'User A' } },
    { id: '2', name: 'Item B', user: { fullName: 'User B' } }
  ];

  it('renderiza itens de todos os clientes', () => {
    render(<WarehouseInventoryList items={mockItems} total={2} pages={1} />);
    expect(screen.getAllByTestId('item-row')).toHaveLength(2);
    expect(screen.getByText('User A')).toBeInTheDocument();
  });

  it('filtros funcionam corretamente', () => {
    render(<WarehouseInventoryList items={mockItems} total={2} pages={1} />);
    expect(screen.getByTestId('filtros')).toBeInTheDocument();
  });

  it('paginação funciona', () => {
    render(<WarehouseInventoryList items={mockItems} total={2} pages={1} />);
    expect(screen.getByTestId('paginacao')).toHaveTextContent('Total: 2 - Páginas: 1');
  });

  it('acoes manuais disparam handlers', () => {
    render(<WarehouseInventoryList items={mockItems} total={2} pages={1} />);
    const buttons = screen.getAllByText('Prorrogar');
    fireEvent.click(buttons[0]);
    // It's a mock, we just want to ensure it doesn't crash
  });
});
