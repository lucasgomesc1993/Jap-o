import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui';
import styles from './cadastro.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Cadastro | NipponBox',
  description: 'Crie sua conta na NipponBox e comece a importar do Japão.',
};

export default function CadastroPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            Nippon<span>Box</span>
          </Link>
          <h1 className={styles.title}>Crie sua conta</h1>
          <p className={styles.subtitle}>
            Junte-se à NipponBox e comece a importar do Japão hoje mesmo.
          </p>
        </div>
        
        <Card className={styles.card}>
          <RegisterForm />
        </Card>
        
        <p className={styles.footer}>
          Já tem uma conta? <Link href="/login">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
}
