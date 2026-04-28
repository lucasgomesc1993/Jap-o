import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShipmentList from './ShipmentList';
import { ShipmentStatus } from '@prisma/client';

describe('ShipmentList Component', () => {
  const mockShipments = [
    {
      id: 'ship-1',
      shippingMethod: 'EMS',
      status: 'PREPARING' as ShipmentStatus,
      createdAt: new Date('2026-04-28T10:00:00Z'),
      shippingCostBrl: 160,
      insuranceCostBrl: 10,
      totalWeightGrams: 500,
      trackingCode: null,
      shipmentItems: [{ id: 'si-1', warehouseItem: { id: 'wi-1', name: 'Item 1' } }],
    },
    {
      id: 'ship-2',
      shippingMethod: 'DHL',
      status: 'SHIPPED' as ShipmentStatus,
      createdAt: new Date('2026-04-27T10:00:00Z'),
      shippingCostBrl: 300,
      insuranceCostBrl: 20,
      totalWeightGrams: 1000,
      trackingCode: 'TRACK123',
      shipmentItems: [{ id: 'si-2', warehouseItem: { id: 'wi-2', name: 'Item 2' } }],
    }
  ];

  it('deve renderizar a lista de envios', () => {
    render(<ShipmentList initialShipments={mockShipments} />);
    
    expect(screen.getByText('Meus Envios')).toBeInTheDocument();
    expect(screen.getByText('EMS')).toBeInTheDocument();
    expect(screen.getByText('DHL')).toBeInTheDocument();
    expect(screen.getAllByText('Preparando')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Postado')[0]).toBeInTheDocument();
  });

  it('deve exibir mensagem de estado vazio quando não há envios', () => {
    render(<ShipmentList initialShipments={[]} />);
    expect(screen.getByText('Nenhum envio encontrado')).toBeInTheDocument();
  });

  it('deve formatar corretamente os valores monetários', () => {
    render(<ShipmentList initialShipments={mockShipments} />);
    // ship-1: 160 + 10 = 170. formatCurrency should produce R$ 170,00
    expect(screen.getByText(/R\$\s?170,00/)).toBeInTheDocument();
  });
});
