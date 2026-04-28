import { Card } from '@/components/ui';
import styles from './confirmar-email.module.css';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Confirme seu e-mail | NipponBox',
};

export default function ConfirmarEmailPage() {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.icon}>
          <MailCheck size={64} />
        </div>
        <h1 className={styles.title}>Verifique seu e-mail</h1>
        <p className={styles.text}>
          Enviamos um link de confirmação para o seu endereço de e-mail. 
          Por favor, clique no link para ativar sua conta e acessar seu dashboard.
        </p>
        <div className={styles.divider} />
        <div className={styles.footer}>
          <p>Não recebeu o e-mail?</p>
          <button className={styles.resendBtn}>Reenviar confirmação</button>
          <Link href="/login" className={styles.backLink}>
            Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  );
}
