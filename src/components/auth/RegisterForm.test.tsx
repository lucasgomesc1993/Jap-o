import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { ToastContainer } from '../ui/Toast/Toast';
import { registerAction } from '@/app/auth/actions';
import { server } from '@/tests/setup';
import { http, HttpResponse } from 'msw';

vi.setConfig({ testTimeout: 60000 });

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/app/auth/actions', () => ({
  registerAction: vi.fn(),
}));

describe('RegisterForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    server.use(
      http.get('https://viacep.com.br/ws/:cep/json/', () => {
        return HttpResponse.json({
          logradouro: 'Rua Japão',
          bairro: 'Liberdade',
          localidade: 'São Paulo',
          uf: 'SP',
          erro: false
        });
      })
    );
  });

  const fillStep1 = async (user: any) => {
    await user.type(screen.getByLabelText(/Nome Completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/E-mail/i), 'joao@teste.com');
    await user.type(screen.getByLabelText(/^Senha/i), 'Senha123!');
    await user.type(screen.getByLabelText(/Confirmar Senha/i), 'Senha123!');
    await user.click(screen.getByText(/Próximo Passo/i));
  };

  const fillStep2 = async (user: any) => {
    await user.type(screen.getByLabelText(/CPF/i), '529.982.247-25');
    await user.type(screen.getByLabelText(/Telefone/i), '11999998888');
    await user.click(screen.getByText(/Próximo Passo/i));
  };

  const fillStep3 = async (user: any) => {
    await user.type(screen.getByLabelText(/CEP/i), '01501-000');
    await waitFor(() => expect(screen.getByLabelText(/Rua/i)).toHaveValue('Rua Japão'));
    await user.type(screen.getByLabelText(/Número/i), '123');
  };

  it('deve completar o fluxo de cadastro com sucesso', async () => {
    const user = userEvent.setup();
    (registerAction as any).mockResolvedValue({ success: true });
    render(
      <>
        <RegisterForm />
        <ToastContainer />
      </>
    );
    
    await fillStep1(user);
    await screen.findByText('Dados Pessoais');
    
    await fillStep2(user);
    await screen.findByText('Endereço (Opcional)');

    await fillStep3(user);
    await user.click(screen.getByText('Finalizar Cadastro'));

    await waitFor(() => {
      expect(registerAction).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/confirmar-email');
    });
  });

  it('deve mostrar erro retornado pela action sem mensagem customizada', async () => {
    const user = userEvent.setup();
    (registerAction as any).mockResolvedValue({ success: false });
    render(
      <>
        <RegisterForm />
        <ToastContainer />
      </>
    );
    
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByText('Finalizar Cadastro'));

    await waitFor(() => {
      expect(screen.getByText('Erro no cadastro')).toBeInTheDocument();
      expect(screen.getByText('Verifique os dados e tente novamente.')).toBeInTheDocument();
    });
  });

  it('deve lidar com falha catastrófica na action', async () => {
    const user = userEvent.setup();
    (registerAction as any).mockRejectedValue(new Error('Crash'));
    render(
      <>
        <RegisterForm />
        <ToastContainer />
      </>
    );
    
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByText('Finalizar Cadastro'));

    await waitFor(() => {
      expect(screen.getByText('Erro inesperado')).toBeInTheDocument();
    });
  });

  it('não deve avançar passo se houver erro de validação', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    await user.click(screen.getByText(/Próximo Passo/i));
    expect(screen.getByText('Dados da Conta')).toBeInTheDocument();
    expect(screen.queryByText('Dados Pessoais')).not.toBeInTheDocument();
  });

  it('deve permitir navegar entre passos', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    await fillStep1(user);
    await screen.findByText('Dados Pessoais');
    
    await user.click(screen.getByRole('button', { name: /Voltar/i }));
    await screen.findByText('Dados da Conta');
  });

  it('deve lidar com CEP não encontrado e erro de rede', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await fillStep1(user);
    await fillStep2(user);

    // Erro de rede
    server.use(http.get('https://viacep.com.br/ws/:cep/json/', () => HttpResponse.error()));
    await user.type(screen.getByLabelText(/CEP/i), '00000-001');
    await waitFor(() => expect(console.error).toHaveBeenCalled());

    // CEP não encontrado
    server.use(http.get('https://viacep.com.br/ws/:cep/json/', () => HttpResponse.json({ erro: true })));
    await user.clear(screen.getByLabelText(/CEP/i));
    await user.type(screen.getByLabelText(/CEP/i), '00000-002');
    await waitFor(() => expect(screen.getByLabelText(/Rua/i)).toHaveValue(''));
  });
});
