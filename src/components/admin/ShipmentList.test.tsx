import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShipmentList } from './ShipmentList';
import * as actions from '@/lib/actions/admin-shipments';
import { ShipmentStatus } from '@prisma/client';

vi.mock('@/lib/actions/admin-shipments', () => ({
  getPendingShipments: vi.fn(),
  updateShipmentStatus: vi.fn(),
  markAsShipped: vi.fn(),
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockShipments = [
  {
    id: 'ship-1',
    status: ShipmentStatus.PREPARING,
    shippingMethod: 'EMS',
    totalWeightGrams: 1000,
    declaredValueType: 'REAL',
    createdAt: new Date(),
    user: { fullName: 'John Doe', email: 'john@example.com' },
    address: { street: 'Rua A', number: '123', city: 'São Paulo', state: 'SP' },
    shipmentItems: [{ warehouseItem: { name: 'Item 1' } }],
  },
  {
    id: 'ship-2',
    status: ShipmentStatus.PREPARING,
    shippingMethod: 'DHL',
    totalWeightGrams: 500,
    declaredValueType: 'MANUAL',
    createdAt: new Date(),
    user: { fullName: 'Jane Doe', email: 'jane@example.com' },
    address: { street: 'Rua B', number: '456', city: 'Curitiba', state: 'PR' },
    shipmentItems: [{ warehouseItem: { name: 'Item 2' } }],
  }
];

describe('ShipmentList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (actions.getPendingShipments as any).mockResolvedValue(mockShipments);
  });

  it('renderiza apenas status PREPARING inicialmente', async () => {
    render(<ShipmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const badges = screen.getAllByText('PREPARING');
    expect(badges.length).toBe(2);
  });

  it('exibe flag visual para declaração manual', async () => {
    render(<ShipmentList />);
    
    await waitFor(() => {
      const manualFlag = document.getElementById('manual-flag-ship-2');
      expect(manualFlag).toBeInTheDocument();
      expect(manualFlag?.textContent).toContain('⚠️');
    });
  });

  it('abre o modal de Marcar como Enviado ao clicar no botão', async () => {
    render(<ShipmentList />);
    
    await waitFor(() => {
      const buttons = screen.getAllByText('Marcar Enviado');
      fireEvent.click(buttons[0]);
    });

    expect(screen.getByText('Marcar como Enviado')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de Rastreio')).toBeInTheDocument();
  });
});
