import Link from 'next/link';
import { ArrowRight, Globe } from 'lucide-react';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.gridOverlay} />
      
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <div className={styles.badge}>
            <div className={styles.badgeDot} />
            Proxy Shopping Redefined
          </div>
          
          <h1 className={styles.title}>
            A ponte direta
            <span>para o Japão.</span>
          </h1>
          
          <p className={styles.description}>
            Eliminamos o atrito logístico. Compre de qualquer loja japonesa como se estivesse em Tóquio. Armazenamento gratuito, consolidação inteligente e envio expresso.
          </p>
          
          <div className={styles.actions}>
            <Link href="/cadastro" className={styles.buttonPrimary}>
              Criar Conta Gratuita <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="#frete" className={styles.buttonSecondary}>
              Calcular Fretes <Globe size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div className={styles.statsBlock}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>60d</span>
            <span className={styles.statLabel}>Armazenamento Gratuito</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>0%</span>
            <span className={styles.statLabel}>Taxa de Compra Assistida</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>24h</span>
            <span className={styles.statLabel}>Tempo de Processamento</span>
          </div>
        </div>
      </div>
    </section>
  );
}
