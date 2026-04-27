import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renderiza todas as perguntas', () => {
    render(<FAQ />);
    expect(screen.getByText(/quais plataformas/i)).toBeInTheDocument();
    expect(screen.getByText(/cartão internacional/i)).toBeInTheDocument();
  });

  it('toggle abre e fecha resposta', () => {
    render(<FAQ />);
    const trigger = screen.getByText(/quais plataformas/i).closest('button')!;

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
