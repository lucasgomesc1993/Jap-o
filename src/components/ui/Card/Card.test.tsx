import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card Component', () => {
  it('renderiza children', () => {
    render(<Card><p>Conteúdo do card</p></Card>);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('renderiza título', () => {
    render(<Card title="Meu Card"><p>Corpo</p></Card>);
    expect(screen.getByText('Meu Card')).toBeInTheDocument();
  });

  it('renderiza subtítulo', () => {
    render(<Card title="Card" subtitle="Descrição"><p>Corpo</p></Card>);
    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });

  it('renderiza footer', () => {
    render(
      <Card footer={<button>Ação</button>}>
        <p>Corpo</p>
      </Card>
    );
    expect(screen.getByText('Ação')).toBeInTheDocument();
  });

  it('não renderiza header quando não há título nem subtítulo', () => {
    const { container } = render(<Card><p>Corpo</p></Card>);
    expect(container.querySelector('[class*="header"]')).not.toBeInTheDocument();
  });

  it('aplica className customizado', () => {
    const { container } = render(<Card className="custom-class"><p>Corpo</p></Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
