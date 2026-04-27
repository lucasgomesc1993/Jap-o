import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>N</span>
              <span className={styles.logoText}>NipponBox</span>
            </div>
            <p className={styles.tagline}>
              Seus produtos japoneses favoritos, entregues no Brasil.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Serviço</h4>
              <a href="#como-funciona">Como funciona</a>
              <a href="#plataformas">Plataformas</a>
              <a href="#calculadora">Calculadora de frete</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Legal</h4>
              <a href="/termos">Termos de Uso</a>
              <a href="/privacidade">Política de Privacidade</a>
              <a href="/contato">Contato</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} NipponBox. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
