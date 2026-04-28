import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';

// Mock do useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock da action
vi.mock('@/app/auth/actions', () => ({
  registerAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe('RegisterForm Multi-step', () => {
  it('deve renderizar o passo 1 (Conta) inicialmente', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Dados da Conta')).toBeDefined();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeDefined();
    expect(screen.getByText(/Próximo Passo/i)).toBeDefined();
  });

  it('não deve avançar para o passo 2 se os campos do passo 1 forem inválidos', async () => {
    render(<RegisterForm />);
    const nextBtn = screen.getByText(/Próximo Passo/i);
    
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.queryByText('Dados Pessoais')).toBeNull();
    });
  });

  it('deve avançar para o passo 2 ao preencher dados da conta válidos', async () => {
    render(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'joao@teste.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'Senha123!' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Senha123!' } });

    fireEvent.click(screen.getByText(/Próximo Passo/i));

    await waitFor(() => {
      expect(screen.getByText('Dados Pessoais')).toBeDefined();
    });
  });

  it('deve permitir voltar do passo 2 para o passo 1', async () => {
    render(<RegisterForm />);
    
    // Preencher Passo 1
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'joao@teste.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'Senha123!' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Senha123!' } });
    fireEvent.click(screen.getByText(/Próximo Passo/i));

    // No Passo 2
    await waitFor(() => expect(screen.getByText('Dados Pessoais')).toBeDefined());
    
    fireEvent.click(screen.getByText(/Voltar/i));

    await waitFor(() => {
      expect(screen.getByText('Dados da Conta')).toBeDefined();
    });
  });
});
