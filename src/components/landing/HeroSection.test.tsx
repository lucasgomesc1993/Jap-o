import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renderiza o headline principal', () => {
    render(<HeroSection />);
    expect(screen.getByText(/seus produtos japoneses favoritos/i)).toBeInTheDocument();
  });

  it('renderiza o CTA "Começar agora"', () => {
    render(<HeroSection />);
    const cta = screen.getByText('Começar agora');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/cadastro');
  });

  it('renderiza as estatísticas', () => {
    render(<HeroSection />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Métodos de frete')).toBeInTheDocument();
  });
});
