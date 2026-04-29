import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WarehouseItemList } from './WarehouseItemList';
import { WarehouseItemStatus } from '@prisma/client';

describe('WarehouseItemList', () => {
  const mockOnViewDetails = vi.fn();
  
  it('deve renderizar estado vazio quando não há itens', () => {
    render(<WarehouseItemList items={[]} onViewDetails={mockOnViewDetails} />);
    
    expect(screen.getByTestId('warehouse-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Armazém vazio')).toBeInTheDocument();
  });

  it('deve renderizar a lista de itens', () => {
    const items = [
      {
        id: 'item-1',
        userId: 'user-1',
        orderId: 'order-1',
        name: 'Item 1',
        photos: [],
        weightGrams: 500,
        lengthCm: 10,
        widthCm: 10,
        heightCm: 10,
        arrivedAt: new Date(),
        freeStorageDeadline: null,
        status: WarehouseItemStatus.AVAILABLE,
        lastStorageFeeAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'item-2',
        userId: 'user-1',
        orderId: 'order-2',
        name: 'Item 2',
        photos: [],
        weightGrams: 1000,
        lengthCm: 20,
        widthCm: 20,
        heightCm: 20,
        arrivedAt: new Date(),
        freeStorageDeadline: null,
        status: WarehouseItemStatus.SELECTED_FOR_SHIPMENT,
        lastStorageFeeAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    render(<WarehouseItemList items={items} onViewDetails={mockOnViewDetails} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Selecionado')).toBeInTheDocument();
  });
});
