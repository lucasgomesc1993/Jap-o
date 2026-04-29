import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WarehouseItemCard } from './WarehouseItemCard';
import { WarehouseItemStatus } from '@prisma/client';

// Mock next/image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: any) => <img {...props} alt={props.alt || ''} />
}));

describe('WarehouseItemCard', () => {
  const mockItem = {
    id: 'item-1',
    userId: 'user-1',
    orderId: 'order-1',
    name: 'Test Item',
    photos: ['/photo1.jpg'],
    weightGrams: 500,
    lengthCm: 10,
    widthCm: 10,
    heightCm: 10,
    arrivedAt: new Date(),
    freeStorageDeadline: null,
    status: WarehouseItemStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnViewDetails = vi.fn();

  it('deve renderizar os dados do item corretamente', () => {
    render(<WarehouseItemCard item={mockItem} onViewDetails={mockOnViewDetails} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument();
    expect(screen.getByText('10x10x10cm')).toBeInTheDocument();
    expect(screen.getByText('Disponível')).toBeInTheDocument();
  });

  it('deve chamar onViewDetails ao clicar no botão', () => {
    render(<WarehouseItemCard item={mockItem} onViewDetails={mockOnViewDetails} />);
    
    const button = screen.getByText('Ver Detalhes');
    fireEvent.click(button);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockItem);
  });

  it('deve exibir barra de progresso com 0% para item recém chegado', () => {
    render(<WarehouseItemCard item={mockItem} onViewDetails={mockOnViewDetails} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('deve exibir alerta amarelo quando faltam menos de 7 dias', () => {
    // 40 dias atrás = 5 dias restantes
    const arrivedAt = new Date();
    arrivedAt.setDate(arrivedAt.getDate() - 40);
    
    const warningItem = { ...mockItem, arrivedAt };
    
    render(<WarehouseItemCard item={warningItem} onViewDetails={mockOnViewDetails} />);
    
    const daysRemaining = screen.getByText('5 dias');
    expect(daysRemaining).toHaveStyle('color: #f59e0b');
  });

  it('deve exibir alerta vermelho quando o prazo expirou', () => {
    // 50 dias atrás = expirado
    const arrivedAt = new Date();
    arrivedAt.setDate(arrivedAt.getDate() - 50);
    
    const expiredItem = { ...mockItem, arrivedAt };
    
    render(<WarehouseItemCard item={expiredItem} onViewDetails={mockOnViewDetails} />);
    
    const expiredText = screen.getByText('Vencido');
    expect(expiredText).toHaveStyle('color: var(--primary)');
  });
});
