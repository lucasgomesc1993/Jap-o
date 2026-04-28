import styles from './confirmar-email.module.css';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { ResendButton } from './ResendButton';

export const metadata = {
  title: 'Confirme seu e-mail | NipponBox',
};

export default function ConfirmarEmailPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundText}>NIPPONBOX</div>
      
      <div className={styles.card}>
        <div className={styles.terminalHeader}>
          <div className={styles.statusLabel}>
            <span className={styles.dot} />
            AWAITING_VERIFICATION
          </div>
          <div className={styles.terminalCode}>SEC_TYPE: DOUBLE_OPT_IN</div>
        </div>

        <h1 className={styles.title}>
          Verifique seu <span className="text-primary">e-mail</span>
        </h1>
        
        <p className={styles.text}>
          Enviamos um link de confirmação para o seu endereço de e-mail cadastrado. 
          Por favor, localize a mensagem e clique no link para ativar sua conta e liberar o acesso total ao seu terminal logístico.
        </p>

        <div className={styles.divider} />

        <div className={styles.footer}>
          <div className={styles.resendSection}>
            <span className={styles.footerLabel}>Não recebeu a mensagem?</span>
            <div className={styles.resendAction}>
              <Mail size={16} className="text-primary" style={{ display: 'inline', marginRight: '8px' }} />
              <ResendButton />
            </div>
          </div>

          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={14} />
            Voltar para o portal de acesso
          </Link>
        </div>

        <div className={styles.visualDecorator}>01</div>
      </div>
    </div>
  );
}
