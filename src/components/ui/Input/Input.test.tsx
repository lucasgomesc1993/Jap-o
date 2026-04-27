import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renderiza com label', () => {
    render(<Input label="E-mail" />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('renderiza placeholder', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />);
    expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
  });

  it('renderiza mensagem de erro', () => {
    render(<Input label="CPF" errorMessage="CPF inválido" />);
    expect(screen.getByText('CPF inválido')).toBeInTheDocument();
  });

  it('aplica aria-invalid quando há erro', () => {
    render(<Input label="CPF" errorMessage="CPF inválido" />);
    const input = screen.getByLabelText('CPF');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('não aplica aria-invalid quando não há erro', () => {
    render(<Input label="Nome" />);
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('renderiza helper text', () => {
    render(<Input label="Senha" helperText="Mínimo 8 caracteres" />);
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('mostra erro em vez de helper text quando ambos existem', () => {
    render(<Input label="Email" helperText="Seu email" errorMessage="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
    expect(screen.queryByText('Seu email')).not.toBeInTheDocument();
  });

  it('chama onChange ao digitar', () => {
    const handleChange = vi.fn();
    render(<Input label="Nome" onChange={handleChange} />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Lucas' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renderiza com ícone', () => {
    render(<Input label="Buscar" icon={<span data-testid="search-icon">🔍</span>} />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});
