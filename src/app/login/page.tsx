import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui';
import styles from './login.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Login | NipponBox',
  description: 'Acesse sua conta NipponBox.',
};

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            Nippon<span>Box</span>
          </Link>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>
            Entre com suas credenciais para acessar seu painel.
          </p>
        </div>
        
        <Card className={styles.card}>
          <LoginForm />
        </Card>
        
        <p className={styles.footer}>
          Ainda não tem uma conta? <Link href="/cadastro">Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
}
