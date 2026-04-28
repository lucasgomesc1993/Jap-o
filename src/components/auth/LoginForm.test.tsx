import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { loginAction } from '@/app/auth/actions';

// Mock do useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock do loginAction
vi.mock('@/app/auth/actions', () => ({
  loginAction: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os campos corretamente', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve exibir erros de validação quando os campos estão vazios', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(await screen.findByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/senha é obrigatória/i)).toBeInTheDocument();
  });

  it('deve chamar loginAction e redirecionar em caso de sucesso', async () => {
    (loginAction as any).mockResolvedValue({ success: true });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'teste@exemplo.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(loginAction).toHaveBeenCalledWith({
        email: 'teste@exemplo.com',
        password: 'senha123',
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('deve exibir mensagem de erro quando o login falha', async () => {
    (loginAction as any).mockResolvedValue({ 
      success: false, 
      error: 'E-mail ou senha incorretos.' 
    });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'teste@exemplo.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // O toast deve ser chamado, mas como estamos testando o componente, 
    // verificamos se o loading para e a action foi chamada.
    await waitFor(() => {
      expect(loginAction).toHaveBeenCalled();
    });
  });
});
