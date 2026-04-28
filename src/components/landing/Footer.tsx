import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.col}>
            <span className={styles.colTitle}>Navegação</span>
            <Link href="/" className={styles.link}>Início</Link>
            <Link href="#frete" className={styles.link}>Cálculo de Frete</Link>
            <Link href="/cadastro" className={styles.link}>Criar Conta</Link>
            <Link href="/login" className={styles.link}>Acesso ao Painel</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Legal</span>
            <Link href="/termos" className={styles.link}>Termos de Uso</Link>
            <Link href="/privacidade" className={styles.link}>Política de Privacidade</Link>
            <Link href="/contato" className={styles.link}>Contato</Link>
            <Link href="/artigos-proibidos" className={styles.link}>Itens Proibidos</Link>
          </div>
        </div>

        <span className={styles.hugeLogo}>Nippon<span>Box</span></span>

        <div className={styles.bottom}>
          <span>&copy; {new Date().getFullYear()} NipponBox Logistics.</span>
          <span>Tokyo, JP → São Paulo, BR</span>
        </div>
      </div>
    </footer>
  );
}
