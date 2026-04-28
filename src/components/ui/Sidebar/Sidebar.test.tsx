import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar, type SidebarItem } from './Sidebar';

describe('Sidebar Component', () => {
  const mockItems: SidebarItem[] = [
    { id: '1', label: 'Início', href: '/dashboard', icon: <span>🏠</span> },
    { id: '2', label: 'Pedidos', href: '/dashboard/pedidos', icon: <span>📦</span> },
    { id: '3', label: 'Carteira', href: '/dashboard/carteira', icon: <span>💰</span> },
  ];

  it('deve renderizar todos os itens', () => {
    render(<Sidebar items={mockItems} />);
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Carteira')).toBeInTheDocument();
  });

  it('deve marcar o item ativo corretamente', () => {
    render(<Sidebar items={mockItems} activeItemId="2" />);
    const activeItem = screen.getByText('Pedidos').closest('a');
    expect(activeItem).toHaveClass(/active/);
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('deve disparar onItemClick ao clicar em um item', () => {
    const handleClick = vi.fn();
    render(<Sidebar items={mockItems} onItemClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Início'));
    
    expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<Sidebar items={mockItems} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('deve prevenir o comportamento padrão do link quando onItemClick é fornecido', () => {
    const handleClick = vi.fn();
    render(<Sidebar items={mockItems} onItemClick={handleClick} />);
    
    const link = screen.getByText('Início').closest('a');
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
    link?.dispatchEvent(clickEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('deve renderizar os índices dos itens [01], [02], etc', () => {
    render(<Sidebar items={mockItems} />);
    expect(screen.getByText('[01]')).toBeInTheDocument();
    expect(screen.getByText('[02]')).toBeInTheDocument();
    expect(screen.getByText('[03]')).toBeInTheDocument();
  });

  it('deve ter o atributo href correto nos links', () => {
    render(<Sidebar items={mockItems} />);
    const link = screen.getByText('Pedidos').closest('a');
    expect(link).toHaveAttribute('href', '/dashboard/pedidos');
  });

  it('deve renderizar item sem ícone e funcionar sem callback de clique', () => {
    const items = [{ id: '1', label: 'Sem Ícone', href: '#' }];
    render(<Sidebar items={items} />);
    
    const link = screen.getByText('Sem Ícone');
    fireEvent.click(link);
    // Não deve quebrar
    expect(link).toBeInTheDocument();
  });
});
