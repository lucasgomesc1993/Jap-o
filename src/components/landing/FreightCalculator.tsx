'use client';
import { useState } from 'react';
import { Calculator, Plane, Ship } from 'lucide-react';
import styles from './FreightCalculator.module.css';

export function FreightCalculator() {
  const [weight, setWeight] = useState(1500);

  // Simulação de cálculo logístico
  const emsPrice = (weight / 1000) * 120 + 50; // Base fictícia
  const seamailPrice = (weight / 1000) * 40 + 30;

  return (
    <section className={styles.section} id="frete">
      <div className={styles.container}>
        <div className={styles.textBlock}>
          <span className={styles.label}>Inteligência Logística</span>
          <h2 className={styles.title}>Transparência absoluta no frete internacional.</h2>
          <p className={styles.desc}>
            Sem surpresas. Simule o peso estimado da sua caixa consolidada e compare os métodos de envio oficiais do Japan Post.
          </p>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={styles.terminalTitle}>
              <Calculator size={14} strokeWidth={2} /> Simulador de Despacho
            </span>
            <span className={styles.terminalTitle} style={{color: 'var(--color-primary)'}}>
              TYO → BRA
            </span>
          </div>

          <div className={styles.terminalBody}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Massa Estimada (Gramas)</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="range" 
                  min="500" 
                  max="30000" 
                  step="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className={styles.rangeInput}
                />
                <div className={styles.weightValue}>
                  {(weight / 1000).toFixed(1)}
                  <span className={styles.weightUnit}>kg</span>
                </div>
              </div>
            </div>

            <div className={styles.results}>
              <div className={styles.resultRow}>
                <div className={styles.methodInfo}>
                  <Plane size={20} strokeWidth={1.5} color="var(--color-on-background)" />
                  <div>
                    <div className={styles.methodName}>EMS Expresso</div>
                    <div className={styles.methodTime}>7 a 14 dias úteis</div>
                  </div>
                </div>
                <div className={styles.price}>
                  R$ {emsPrice.toFixed(0)}
                </div>
              </div>

              <div className={styles.resultRow}>
                <div className={styles.methodInfo}>
                  <Ship size={20} strokeWidth={1.5} color="var(--color-on-background)" />
                  <div>
                    <div className={styles.methodName}>Surface (Marítimo)</div>
                    <div className={styles.methodTime}>60 a 90 dias úteis</div>
                  </div>
                </div>
                <div className={styles.price}>
                  R$ {seamailPrice.toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
