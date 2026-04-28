import styles from './landing.module.css';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/HeroSection';
import { Philosophy } from '@/components/landing/Philosophy';
import { Process } from '@/components/landing/Process';
import { FreightCalculator } from '@/components/landing/FreightCalculator';
import { Platforms } from '@/components/landing/Platforms';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>N</div>
            <span className={styles.logoText}>NipponBox</span>
          </Link>
          
          <nav className={styles.headerNav}>
            <Link href="#como-funciona">Processo</Link>
            <Link href="#frete">Calculadora</Link>
            <Link href="#faq">FAQ</Link>
          </nav>
          
          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginLink}>Login</Link>
            <Link href="/cadastro" className={styles.ctaSmall}>Começar Agora</Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <Platforms />
        <Philosophy />
        <Process />
        <FreightCalculator />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
