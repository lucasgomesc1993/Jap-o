import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Japão → Brasil</span>
          <h1 className={styles.title}>
            Seus produtos japoneses favoritos,
            <br />
            <span className={styles.accent}>entregues no Brasil</span>
          </h1>
          <p className={styles.subtitle}>
            Compre de qualquer loja japonesa — Amazon JP, Mercari, Rakuten, Yahoo
            Auctions — e receba em casa com frete consolidado e rastreamento
            completo.
          </p>
          <div className={styles.actions}>
            <a href="/cadastro" className={styles.ctaPrimary}>
              Começar agora
            </a>
            <a href="#como-funciona" className={styles.ctaSecondary}>
              Como funciona
            </a>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>Métodos de frete</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>Plataformas JP</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Rastreável</span>
            </div>
          </div>
        </div>
        <div className={styles.visual}>
          <div className={styles.visualCard}>
            <div className={styles.cardMockup}>
              <div className={styles.mockupStripe} />
              <div className={styles.mockupContent}>
                <div className={styles.mockupIcon}>📦</div>
                <span className={styles.mockupTitle}>Seu Pedido</span>
                <span className={styles.mockupStatus}>No Armazém JP</span>
                <div className={styles.mockupProgress}>
                  <div className={styles.progressBar} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
