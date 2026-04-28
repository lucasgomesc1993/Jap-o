import { render, screen, fireEvent, within } from '@testing-library/react';
import { WarehouseClient } from './WarehouseClient';
import { WarehouseItemStatus } from '@prisma/client';
import { describe, it, expect, vi } from 'vitest';

const mockItems = [
  {
    id: '1',
    userId: 'user-1',
    orderId: 'order-1',
    name: 'Item 1',
    photos: [],
    weightGrams: 500,
    lengthCm: 10,
    widthCm: 10,
    heightCm: 10,
    arrivedAt: new Date().toISOString(),
    freeStorageDeadline: new Date().toISOString(),
    status: WarehouseItemStatus.AVAILABLE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extraServices: [],
  },
  {
    id: '2',
    userId: 'user-1',
    orderId: 'order-2',
    name: 'Item 2',
    photos: [],
    weightGrams: 300,
    lengthCm: 5,
    widthCm: 5,
    heightCm: 5,
    arrivedAt: new Date().toISOString(),
    freeStorageDeadline: new Date().toISOString(),
    status: WarehouseItemStatus.AVAILABLE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extraServices: [],
  },
  {
    id: '3',
    userId: 'user-1',
    orderId: 'order-3',
    name: 'Item 3 (Selecionado)',
    photos: [],
    weightGrams: 1000,
    lengthCm: 20,
    widthCm: 20,
    heightCm: 20,
    arrivedAt: new Date().toISOString(),
    freeStorageDeadline: new Date().toISOString(),
    status: WarehouseItemStatus.SELECTED_FOR_SHIPMENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extraServices: [],
  },
];

describe('Warehouse Selection (Task 3.4)', () => {
  it('should toggle item selection when clicking on the card', () => {
    render(<WarehouseClient items={mockItems as any} wallet={null} />);
    
    const itemCard = screen.getByTestId('warehouse-item-1');
    
    // Selecionar
    fireEvent.click(itemCard);
    const summary = screen.getByTestId('shipment-summary');
    expect(summary).toBeDefined();
    expect(within(summary).getByText('1')).toBeDefined(); // Contagem de itens
    expect(within(summary).getByText('500g')).toBeDefined(); // Peso total
    
    // Deselecionar
    fireEvent.click(itemCard);
    expect(screen.queryByTestId('shipment-summary')).toBeNull();
  });

  it('should toggle item selection when clicking the checkbox', () => {
    render(<WarehouseClient items={mockItems as any} wallet={null} />);
    
    const checkbox = screen.getByTestId('item-checkbox-1');
    
    // Selecionar
    fireEvent.click(checkbox);
    expect(screen.getByTestId('shipment-summary')).toBeDefined();
    
    // Deselecionar
    fireEvent.click(checkbox);
    expect(screen.queryByTestId('shipment-summary')).toBeNull();
  });

  it('should update total weight and count when selecting multiple items', () => {
    render(<WarehouseClient items={mockItems as any} wallet={null} />);
    
    fireEvent.click(screen.getByTestId('warehouse-item-1'));
    fireEvent.click(screen.getByTestId('warehouse-item-2'));
    
    const summary = screen.getByTestId('shipment-summary');
    expect(within(summary).getByText('2')).toBeDefined();
    expect(within(summary).getByText('800g')).toBeDefined(); // 500 + 300
  });

  it('should NOT allow selecting items with status SELECTED_FOR_SHIPMENT', () => {
    render(<WarehouseClient items={mockItems as any} wallet={null} />);
    
    const itemCard = screen.getByTestId('warehouse-item-3');
    
    // Tentar selecionar
    fireEvent.click(itemCard);
    
    // Checkbox não deve existir para este item
    expect(screen.queryByTestId('item-checkbox-3')).toBeNull();
    // Resumo não deve aparecer
    expect(screen.queryByTestId('shipment-summary')).toBeNull();
  });

  it('should show the correct text for single vs multiple items', () => {
    render(<WarehouseClient items={mockItems as any} wallet={null} />);
    
    fireEvent.click(screen.getByTestId('warehouse-item-1'));
    const summary1 = screen.getByTestId('shipment-summary');
    expect(within(summary1).getByText('1')).toBeDefined();
    expect(within(summary1).getByText(/item selecionado/)).toBeDefined();
    
    fireEvent.click(screen.getByTestId('warehouse-item-2'));
    const summary2 = screen.getByTestId('shipment-summary');
    expect(within(summary2).getByText('2')).toBeDefined();
    expect(within(summary2).getByText(/itens selecionados/)).toBeDefined();
  });
});
