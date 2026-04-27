import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore, toast } from './toast.store';

describe('Toast Store', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('adiciona um toast', () => {
    const id = useToastStore.getState().addToast({
      type: 'success',
      message: 'Operação realizada!',
    });
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].message).toBe('Operação realizada!');
    expect(toasts[0].type).toBe('success');
  });

  it('remove um toast pelo id', () => {
    const id = useToastStore.getState().addToast({
      type: 'error',
      message: 'Erro!',
    });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('empilha múltiplos toasts', () => {
    useToastStore.getState().addToast({ type: 'success', message: 'Toast 1' });
    useToastStore.getState().addToast({ type: 'warning', message: 'Toast 2' });
    useToastStore.getState().addToast({ type: 'error', message: 'Toast 3' });
    expect(useToastStore.getState().toasts).toHaveLength(3);
  });

  it('limpa todos os toasts', () => {
    useToastStore.getState().addToast({ type: 'info', message: 'Info' });
    useToastStore.getState().addToast({ type: 'error', message: 'Error' });
    useToastStore.getState().clearAll();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  describe('helpers globais', () => {
    it('toast.success adiciona toast do tipo success', () => {
      toast.success('Sucesso!');
      const t = useToastStore.getState().toasts[0];
      expect(t.type).toBe('success');
      expect(t.message).toBe('Sucesso!');
    });

    it('toast.error adiciona toast do tipo error', () => {
      toast.error('Erro!');
      const t = useToastStore.getState().toasts[0];
      expect(t.type).toBe('error');
    });

    it('toast.warning adiciona toast do tipo warning', () => {
      toast.warning('Aviso!');
      const t = useToastStore.getState().toasts[0];
      expect(t.type).toBe('warning');
    });

    it('toast.info adiciona toast do tipo info', () => {
      toast.info('Informação!');
      const t = useToastStore.getState().toasts[0];
      expect(t.type).toBe('info');
    });
  });
});
