'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useToast } from '@/components/ui';
import styles from './confirmar-email.module.css';

export function ResendButton() {
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('E-mail não encontrado. Tente fazer login novamente.');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      addToast({
        title: 'E-mail enviado',
        message: 'Um novo link de confirmação foi enviado para seu e-mail.',
        type: 'success',
      });
      setCooldown(60);
    } catch (error) {
      addToast({
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Falha ao reenviar e-mail.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={styles.resendBtn} 
      onClick={handleResend}
      disabled={isLoading || cooldown > 0}
      style={{ opacity: cooldown > 0 || isLoading ? 0.6 : 1, cursor: cooldown > 0 || isLoading ? 'not-allowed' : 'pointer' }}
    >
      {isLoading ? 'Enviando...' : cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar confirmação'}
    </button>
  );
}
