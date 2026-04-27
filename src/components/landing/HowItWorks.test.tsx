import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks', () => {
  it('renderiza 4 steps', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Envie o link')).toBeInTheDocument();
    expect(screen.getByText('Pague com Pix')).toBeInTheDocument();
    expect(screen.getByText('Armazene no JP')).toBeInTheDocument();
    expect(screen.getByText('Receba no Brasil')).toBeInTheDocument();
  });

  it('cada step tem título e descrição', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/cole a url do produto/i)).toBeInTheDocument();
  });

  it('renderiza o título da seção', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/4 passos/i)).toBeInTheDocument();
  });
});
