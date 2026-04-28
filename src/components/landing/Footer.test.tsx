import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renderiza link para Termos de Uso', () => {
    render(<Footer />);
    const link = screen.getByText('Termos de Uso');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/termos');
  });

  it('renderiza link para Política de Privacidade', () => {
    render(<Footer />);
    const link = screen.getByText('Política de Privacidade');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/privacidade');
  });

  it('renderiza link para Contato', () => {
    render(<Footer />);
    const link = screen.getByText('Contato');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/contato');
  });

  it('renderiza o copyright com ano atual', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  it('renderiza o nome NipponBox', () => {
    render(<Footer />);
    // Usamos getAllByText pois o nome aparece no logo e no copyright
    expect(screen.getAllByText(/Nippon/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Box/i)[0]).toBeInTheDocument();
  });
});
