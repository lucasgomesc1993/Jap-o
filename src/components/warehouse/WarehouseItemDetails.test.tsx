import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WarehouseItemDetails } from './WarehouseItemDetails';
import { WarehouseItemStatus, ExtraServiceStatus, ExtraServiceType } from '@prisma/client';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}));

describe('WarehouseItemDetails', () => {
  const mockItem = {
    id: 'item-1-uuid',
    userId: 'user-1',
    orderId: 'order-1',
    name: 'Test Item Full Details',
    photos: ['/photo1.jpg', '/photo2.jpg'],
    weightGrams: 750,
    lengthCm: 15,
    widthCm: 12,
    heightCm: 8,
    arrivedAt: new Date('2026-04-01T10:00:00Z'),
    freeStorageDeadline: null,
    status: WarehouseItemStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
    extraServices: [
      {
        id: 'service-1',
        warehouseItemId: 'item-1-uuid',
        type: ExtraServiceType.EXTRA_PHOTO,
        status: ExtraServiceStatus.COMPLETED,
        price: 5.0,
        resultNotes: 'More photos added',
        resultPhotos: [],
        createdAt: new Date('2026-04-02T10:00:00Z'),
        updatedAt: new Date(),
      }
    ]
  };

  const mockOnClose = vi.fn();

  it('deve renderizar os detalhes completos do item', () => {
    render(<WarehouseItemDetails item={mockItem} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Item Full Details')).toBeInTheDocument();
    expect(screen.getByText('750g')).toBeInTheDocument();
    expect(screen.getByText('15 x 12 x 8 cm')).toBeInTheDocument();
    expect(screen.getByText(/01 de abril de 2026/i)).toBeInTheDocument();
    expect(screen.getByText('ITEM')).toBeInTheDocument();
  });

  it('deve renderizar a galeria de fotos e permitir troca', () => {
    render(<WarehouseItemDetails item={mockItem} isOpen={true} onClose={mockOnClose} />);
    
    const thumbnails = screen.getAllByRole('img', { name: /thumbnail/i });
    expect(thumbnails).toHaveLength(2);
    
    const mainImage = screen.getByRole('img', { name: 'Test Item Full Details' });
    expect(mainImage).toHaveAttribute('src', '/photo1.jpg');
    
    fireEvent.click(thumbnails[1]);
    expect(mainImage).toHaveAttribute('src', '/photo2.jpg');
  });

  it('deve exibir o histórico de serviços extras', () => {
    render(<WarehouseItemDetails item={mockItem} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Fotos Extras')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText(/02\/04\/2026/)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há serviços extras', () => {
    const itemNoServices = { ...mockItem, extraServices: [] };
    render(<WarehouseItemDetails item={itemNoServices} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Nenhum serviço extra solicitado para este item.')).toBeInTheDocument();
  });
});
