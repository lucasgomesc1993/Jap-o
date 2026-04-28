'use client';
import { useState } from 'react';
import { Calculator, Plane, Ship, Zap, Package } from 'lucide-react';
import styles from './FreightCalculator.module.css';

export function calculateVolume(l: number, w: number, h: number) {
  return (l * w * h) / 5000;
}

export function calculateFreight(weight: number, l: number, w: number, h: number) {
  const volWeight = calculateVolume(l, w, h) * 1000;
  const finalWeight = Math.max(weight, volWeight);
  const kg = finalWeight / 1000;

  return [
    {
      method: 'SAL',
      price: `R$ ${(45 + kg * 28).toFixed(2)}`,
      days: '15-30 dias',
      icon: <Ship size={20} strokeWidth={1.5} color="var(--color-on-background)" />
    },
    {
      method: 'EMS',
      price: `R$ ${(120 + kg * 55).toFixed(2)}`,
      days: '7-14 dias',
      icon: <Plane size={20} strokeWidth={1.5} color="var(--color-on-background)" />
    },
    {
      method: 'DHL',
      price: `R$ ${(250 + kg * 80).toFixed(2)}`,
      days: '3-5 dias',
      icon: <Zap size={20} strokeWidth={1.5} color="var(--color-on-background)" />
    },
    {
      method: 'FedEx',
      price: `R$ ${(230 + kg * 75).toFixed(2)}`,
      days: '4-6 dias',
      icon: <Package size={20} strokeWidth={1.5} color="var(--color-on-background)" />
    }
  ];
}

export function FreightCalculator() {
  const [weight, setWeight] = useState<string>('1000');
  const [length, setLength] = useState<string>('30');
  const [width, setWidth] = useState<string>('20');
  const [height, setHeight] = useState<string>('15');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const w = Number(weight);
    const l = Number(length);
    const wd = Number(width);
    const h = Number(height);

    if (w <= 0 || l <= 0 || wd <= 0 || h <= 0) {
      setError('Todos os campos devem ser maiores que zero');
      setResults([]);
      return;
    }

    setResults(calculateFreight(w, l, wd, h));
  };

  return (
    <section className={styles.section} id="frete">
      <div className={styles.container}>
        <div className={styles.textBlock}>
          <span className={styles.label}>Inteligência Logística</span>
          <h2 className={styles.title}>Transparência absoluta no frete internacional.</h2>
          <p className={styles.desc}>
            Sem surpresas. Simule o peso real ou volumétrico e compare os métodos de envio.
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

          <form className={styles.terminalBody} onSubmit={handleCalculate}>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="weight" className={styles.inputLabel}>Peso (gramas)</label>
                <input 
                  id="weight"
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="length" className={styles.inputLabel}>Comp. (cm)</label>
                <input 
                  id="length"
                  type="number" 
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="width" className={styles.inputLabel}>Larg. (cm)</label>
                <input 
                  id="width"
                  type="number" 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="height" className={styles.inputLabel}>Alt. (cm)</label>
                <input 
                  id="height"
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <button type="submit" className={styles.calcButton}>
              Calcular Frete
            </button>

            {error && <div className={styles.error}>{error}</div>}

            {results.length > 0 && (
              <div className={styles.results}>
                {results.map((res, i) => (
                  <div key={i} className={styles.resultRow}>
                    <div className={styles.methodInfo}>
                      {res.icon}
                      <div>
                        <div className={styles.methodName}>{res.method}</div>
                        <div className={styles.methodTime}>{res.days}</div>
                      </div>
                    </div>
                    <div className={styles.price}>{res.price}</div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
