import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}


interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Helper para disparar toast de qualquer lugar da aplicação
 */
export const toast = {
  success: (message: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'success', message, duration }),
  error: (message: string, duration = 6000) =>
    useToastStore.getState().addToast({ type: 'error', message, duration }),
  warning: (message: string, duration = 5000) =>
    useToastStore.getState().addToast({ type: 'warning', message, duration }),
  info: (message: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'info', message, duration }),
};
