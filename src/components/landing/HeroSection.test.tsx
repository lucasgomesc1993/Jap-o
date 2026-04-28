import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renderiza o headline principal', () => {
    render(<HeroSection />);
    expect(screen.getByText(/a ponte direta/i)).toBeInTheDocument();
    expect(screen.getByText(/para o Japão/i)).toBeInTheDocument();
  });

  it('renderiza o CTA "Começar agora"', () => {
    render(<HeroSection />);
    const cta = screen.getByText(/Criar Conta Gratuita/i);
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/cadastro');
  });

  it('renderiza as estatísticas', () => {
    render(<HeroSection />);
    expect(screen.getByText('60d')).toBeInTheDocument();
    expect(screen.getByText('Armazenamento Gratuito')).toBeInTheDocument();
  });
});
