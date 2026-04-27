import styles from './landing.module.css';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Platforms } from '@/components/landing/Platforms';
import { FreightCalculator } from '@/components/landing/FreightCalculator';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoMark}>N</span>
            <span className={styles.logoText}>NipponBox</span>
          </a>
          <nav className={styles.headerNav} aria-label="Navegação principal">
            <a href="#como-funciona">Como Funciona</a>
            <a href="#plataformas">Plataformas</a>
            <a href="#calculadora">Frete</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className={styles.headerActions}>
            <a href="/login" className={styles.loginLink}>Entrar</a>
            <a href="/cadastro" className={styles.ctaSmall}>Criar Conta</a>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <HowItWorks />
        <Platforms />
        <FreightCalculator />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
