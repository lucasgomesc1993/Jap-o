'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators/login.schema';
import { Button, Input } from '@/components/ui';
import { useState } from 'react';
import { loginAction } from '@/app/auth/actions';
import { useToastStore } from '@/stores/toast.store';
import { Mail, Lock } from 'lucide-react';

import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const toast = useToastStore((state) => state.addToast);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await loginAction(data);
      if (result.success) {
        toast({
          title: 'Bem-vindo de volta!',
          message: 'Login realizado com sucesso.',
          type: 'success'
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        toast({
          title: 'Erro no login',
          message: result.error || 'E-mail ou senha incorretos.',
          type: 'error'
        });
      }
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        message: 'Não foi possível realizar o login.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        icon={<Mail size={18} />}
        errorMessage={errors.email?.message}
        {...register('email')}
      />
      <div className={styles.passwordField}>
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          errorMessage={errors.password?.message}
          {...register('password')}
        />

        <a href="/recuperar-senha" className={styles.forgot}>Esqueci minha senha</a>
      </div>

      <Button type="submit" loading={loading} className={styles.submitBtn}>
        Entrar
      </Button>
    </form>
  );
}
