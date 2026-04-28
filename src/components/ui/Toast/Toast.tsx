'use client';

import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { useToastStore, type ToastType } from '@/stores/toast.store';

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notificações">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          duration={t.duration}

          onDismiss={removeToast}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;

  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, title, message, duration = 4000, onDismiss }) => {

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{icons[type]}</span>
      <div className={styles.content}>
        {title && <span className={styles.title}>{title}</span>}
        <span className={styles.message}>{message}</span>
      </div>

      <button
        className={styles.close}
        onClick={() => onDismiss(id)}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
};
