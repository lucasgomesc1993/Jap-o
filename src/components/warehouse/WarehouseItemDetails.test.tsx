import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WarehouseItemDetails } from './WarehouseItemDetails';
import { WarehouseItemStatus, ExtraServiceStatus, ExtraServiceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}));

// Mock server actions
vi.mock('@/lib/actions/warehouse', () => ({
  requestExtraService: vi.fn()
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
        price: new Decimal(5.0),
        resultNotes: 'More photos added',
        resultPhotos: [],
        createdAt: new Date('2026-04-02T10:00:00Z'),
        updatedAt: new Date(),
      }
    ]
  };

  const mockWallet = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: new Decimal(50),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnClose = vi.fn();

  it('deve renderizar os detalhes completos do item', () => {
    render(<WarehouseItemDetails item={mockItem} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Item Full Details')).toBeInTheDocument();
    expect(screen.getByText('750g')).toBeInTheDocument();
    expect(screen.getByText('15 x 12 x 8 cm')).toBeInTheDocument();
    expect(screen.getByText(/01 de abril de 2026/i)).toBeInTheDocument();
    expect(screen.getByText('ITEM')).toBeInTheDocument();
  });

  it('deve renderizar a galeria de fotos e permitir troca', () => {
    render(<WarehouseItemDetails item={mockItem} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    const thumbnails = screen.getAllByRole('img', { name: /thumbnail/i });
    expect(thumbnails).toHaveLength(2);
    
    const mainImage = screen.getByRole('img', { name: 'Test Item Full Details' });
    expect(mainImage).toHaveAttribute('src', '/photo1.jpg');
    
    fireEvent.click(thumbnails[1]);
    expect(mainImage).toHaveAttribute('src', '/photo2.jpg');
  });

  it('deve exibir o histórico de serviços extras', () => {
    render(<WarehouseItemDetails item={mockItem} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    // "Foto Extra" aparece tanto na lista de solicitados quanto nas opções de novos serviços
    const serviceNames = screen.getAllByText('Foto Extra');
    expect(serviceNames.length).toBeGreaterThan(0);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText(/02\/04\/2026/)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há serviços extras', () => {
    const itemNoServices = { ...mockItem, extraServices: [] };
    render(<WarehouseItemDetails item={itemNoServices} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Nenhum serviço extra solicitado para este item.')).toBeInTheDocument();
  });

  it('deve renderizar botões de serviço com preços corretos', () => {
    render(<WarehouseItemDetails item={mockItem} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Quality Check')).toBeInTheDocument();
    expect(screen.getByText('R$ 10.00')).toBeInTheDocument();
    expect(screen.getByText('Proteção Extra')).toBeInTheDocument();
    expect(screen.getByText('R$ 8.00')).toBeInTheDocument();
  });

  it('deve abrir modal de confirmação ao clicar em solicitar', () => {
    render(<WarehouseItemDetails item={mockItem} wallet={mockWallet} isOpen={true} onClose={mockOnClose} />);
    
    // Quality Check não foi solicitado no mockItem (apenas EXTRA_PHOTO)
    const requestButtons = screen.getAllByRole('button', { name: /solicitar/i });
    fireEvent.click(requestButtons[0]); // Quality Check é o primeiro 'Solicitar' disponível
    
    expect(screen.getByText('Confirmar Serviço Extra')).toBeInTheDocument();
    expect(screen.getByText(/Deseja solicitar o serviço/i)).toBeInTheDocument();
  });

  it('deve desabilitar botão se o saldo for insuficiente', () => {
    const poorWallet = { ...mockWallet, balance: new Decimal(2) }; // Saldo R$2
    render(<WarehouseItemDetails item={mockItem} wallet={poorWallet} isOpen={true} onClose={mockOnClose} />);
    
    const disabledButtons = screen.getAllByRole('button', { name: /saldo insuficiente/i });
    expect(disabledButtons.length).toBeGreaterThan(0);
    disabledButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});
