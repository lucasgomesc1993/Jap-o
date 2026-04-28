import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastContainer } from './Toast';
import { useToastStore } from '@/stores/toast.store';

describe('Toast Component', () => {
  beforeEach(() => {
    act(() => {
      useToastStore.getState().clearAll();
    });
    vi.useFakeTimers();
  });

  it('deve renderizar toasts do store', () => {
    const { addToast } = useToastStore.getState();
    
    act(() => {
      addToast({ type: 'success', title: 'Sucesso!', message: 'Operação concluída' });
    });

    render(<ToastContainer />);

    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Operação concluída')).toBeInTheDocument();
  });

  it('deve remover o toast automaticamente após a duração', () => {
    const { addToast } = useToastStore.getState();
    
    act(() => {
      addToast({ type: 'info', title: 'Aviso', message: 'Este some logo', duration: 1000 });
    });

    render(<ToastContainer />);
    expect(screen.getByText('Aviso')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    expect(screen.queryByText('Aviso')).not.toBeInTheDocument();
  });

  it('deve permitir fechar o toast manualmente', () => {
    const { addToast } = useToastStore.getState();
    const mockRemoveToast = vi.spyOn(useToastStore.getState(), 'removeToast');

    act(() => {
      addToast({ type: 'error', title: 'Erro', message: 'Erro manual' });
    });

    render(<ToastContainer />);
    const closeBtn = screen.getByLabelText(/Fechar notificação/i);
    closeBtn.click();

    expect(mockRemoveToast).toHaveBeenCalled();
  });

  it('não deve remover o toast automaticamente se duration for 0', async () => {
    const { addToast } = useToastStore.getState();
    
    act(() => {
      addToast({ type: 'success', title: 'Persistente', message: 'Não some sozinho', duration: 0 });
    });

    render(<ToastContainer />);
    expect(screen.getByText('Não some sozinho')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Não some sozinho')).toBeInTheDocument();
  });
});
