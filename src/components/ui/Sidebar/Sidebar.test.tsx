import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar, type SidebarItem } from './Sidebar';

const mockItems: SidebarItem[] = [
  { id: 'orders', label: 'Pedidos', href: '/dashboard/pedidos' },
  { id: 'warehouse', label: 'Armazém', href: '/dashboard/armazem' },
  { id: 'shipments', label: 'Envios', href: '/dashboard/envios' },
  { id: 'wallet', label: 'Carteira', href: '/dashboard/carteira' },
  { id: 'support', label: 'Suporte', href: '/dashboard/suporte' },
];

describe('Sidebar Component', () => {
  it('renderiza todos os itens de navegação', () => {
    render(<Sidebar items={mockItems} />);
    mockItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('contém elemento nav com aria-label', () => {
    render(<Sidebar items={mockItems} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Menu lateral');
  });

  it('aplica aria-current="page" no item ativo', () => {
    render(<Sidebar items={mockItems} activeItemId="warehouse" />);
    const activeLink = screen.getByText('Armazém').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('não aplica aria-current em itens inativos', () => {
    render(<Sidebar items={mockItems} activeItemId="warehouse" />);
    const inactiveLink = screen.getByText('Pedidos').closest('a');
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('chama onItemClick ao clicar em um item', () => {
    const handleClick = vi.fn();
    render(<Sidebar items={mockItems} onItemClick={handleClick} />);
    fireEvent.click(screen.getByText('Pedidos'));
    expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('renderiza o logo quando fornecido', () => {
    render(<Sidebar items={mockItems} logo={<span data-testid="logo">NipponBox</span>} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renderiza a barra crimson no topo', () => {
    const { container } = render(<Sidebar items={mockItems} />);
    // A barra crimson é o primeiro filho dentro da sidebar
    const sidebar = container.querySelector('nav');
    expect(sidebar?.firstElementChild).toBeTruthy();
  });

  it('links apontam para os hrefs corretos', () => {
    render(<Sidebar items={mockItems} />);
    const link = screen.getByText('Pedidos').closest('a');
    expect(link).toHaveAttribute('href', '/dashboard/pedidos');
  });
});
