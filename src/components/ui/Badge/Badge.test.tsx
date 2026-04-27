import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renderiza o texto', () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('aplica a variante neutral por padrão', () => {
    const { container } = render(<Badge>Status</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('neutral');
  });

  it('aplica a variante success', () => {
    const { container } = render(<Badge variant="success">Concluído</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('success');
  });

  it('aplica a variante warning', () => {
    const { container } = render(<Badge variant="warning">Pendente</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('warning');
  });

  it('aplica a variante error', () => {
    const { container } = render(<Badge variant="error">Erro</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('error');
  });

  it('aplica a variante primary', () => {
    const { container } = render(<Badge variant="primary">Destaque</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('primary');
  });

  it('aplica tamanho sm', () => {
    const { container } = render(<Badge size="sm">Pequeno</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('sm');
  });
});
