import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonText, SkeletonCard, SkeletonTable } from './Skeleton';

describe('SkeletonText Component', () => {
  it('renderiza com aria-busy=true', () => {
    render(<SkeletonText />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('renderiza 3 linhas por padrão', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('[class*="skeletonLine"]');
    expect(lines.length).toBe(3);
  });

  it('renderiza número customizado de linhas', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('[class*="skeletonLine"]');
    expect(lines.length).toBe(5);
  });

  it('tem texto "Carregando..." para screen readers', () => {
    render(<SkeletonText />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});

describe('SkeletonCard Component', () => {
  it('renderiza com aria-busy=true', () => {
    render(<SkeletonCard />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('aplica height customizada', () => {
    render(<SkeletonCard height="300px" />);
    const el = screen.getByRole('status');
    expect(el).toHaveStyle({ height: '300px' });
  });
});

describe('SkeletonTable Component', () => {
  it('renderiza com aria-busy=true', () => {
    render(<SkeletonTable />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('renderiza 5 linhas por padrão', () => {
    const { container } = render(<SkeletonTable />);
    const rows = container.querySelectorAll('[class*="skeletonTableRow"]');
    expect(rows.length).toBe(5);
  });

  it('renderiza número customizado de linhas e colunas', () => {
    const { container } = render(<SkeletonTable rows={3} columns={6} />);
    const rows = container.querySelectorAll('[class*="skeletonTableRow"]');
    expect(rows.length).toBe(3);
    // Cada row deve ter 6 colunas
    const firstRowCells = rows[0].querySelectorAll('[class*="skeletonCell"]');
    expect(firstRowCells.length).toBe(6);
  });

  it('tem texto acessível para screen readers', () => {
    render(<SkeletonTable />);
    expect(screen.getByText('Carregando tabela...')).toBeInTheDocument();
  });
});
