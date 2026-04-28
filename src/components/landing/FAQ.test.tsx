import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renderiza todas as perguntas', () => {
    render(<FAQ />);
    expect(screen.getByText(/por que não comprar diretamente/i)).toBeInTheDocument();
    expect(screen.getByText(/consolidação de pacotes/i)).toBeInTheDocument();
  });

  it('toggle abre e fecha resposta', () => {
    render(<FAQ />);
    const trigger = screen.getByText(/por que não comprar diretamente/i).closest('button')!;

    // Inicialmente fechada
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Abre
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Fecha
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cada pergunta tem aria-expanded', () => {
    render(<FAQ />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded');
    });
  });
});
