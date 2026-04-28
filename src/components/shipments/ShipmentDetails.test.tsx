import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShipmentDetails from './ShipmentDetails';
import { ShipmentStatus } from '@prisma/client';

// Mock do next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock da action
vi.mock('@/lib/actions/shipment-details', () => ({
  confirmShipmentDelivery: vi.fn(),
}));

describe('ShipmentDetails Component', () => {
  const mockShipment = {
    id: 'ship-12345678',
    shippingMethod: 'EMS',
    status: 'PREPARING' as ShipmentStatus,
    createdAt: new Date('2026-04-28T10:00:00Z'),
    shippingCostBrl: 160,
    insuranceCostBrl: 10,
    totalWeightGrams: 500,
    trackingCode: 'EMS987654321JP',
    declaredValueType: 'REAL',
    declaredValueBrl: 1000,
    address: {
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Jardim',
      city: 'São Paulo',
      state: 'SP',
      cep: '01234-567',
    },
    shipmentItems: [
      {
        id: 'si-1',
        warehouseItem: {
          id: 'wi-1',
          name: 'Action Figure Mario',
          weightGrams: 200,
          photos: ['https://example.com/photo.jpg'],
        },
      }
    ],
  };

  it('deve renderizar os detalhes do envio corretamente', () => {
    render(<ShipmentDetails shipment={mockShipment} />);
    
    expect(screen.getByText(/Envio #SHIP-123/i)).toBeInTheDocument();
    expect(screen.getByText('EMS987654321JP')).toBeInTheDocument();
    expect(screen.getByText('Action Figure Mario')).toBeInTheDocument();
    expect(screen.getByText(/Rua das Flores/i)).toBeInTheDocument();
    expect(screen.getAllByText(/123/i).length).toBeGreaterThan(0);
  });

  it('deve exibir o botão de confirmar entrega apenas no status OUT_FOR_DELIVERY', () => {
    const { rerender } = render(<ShipmentDetails shipment={mockShipment} />);
    expect(screen.queryByText('Confirmar Entrega')).not.toBeInTheDocument();

    const outForDeliveryShipment = { ...mockShipment, status: 'OUT_FOR_DELIVERY' as ShipmentStatus };
    rerender(<ShipmentDetails shipment={outForDeliveryShipment} />);
    expect(screen.getByText('Confirmar Entrega')).toBeInTheDocument();
  });

  it('deve mostrar link de rastreio externo se disponível', () => {
    render(<ShipmentDetails shipment={mockShipment} />);
    const link = screen.getByRole('link', { name: /EMS987654321JP/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('17track.net'));
  });
});
