'use client';

import React, { useState, useCallback } from 'react';
import styles from './FreightCalculator.module.css';

interface FreightResult {
  method: string;
  days: string;
  price: string;
  tier: string;
}

const FREIGHT_RATES: Record<string, { perKg: number; base: number; days: string; tier: string }> = {
  SAL: { perKg: 28, base: 45, days: '~45 dias', tier: '$' },
  EMS: { perKg: 65, base: 85, days: '~15 dias', tier: '$$$' },
  DHL: { perKg: 95, base: 120, days: '~5 dias', tier: '$$$$' },
  FedEx: { perKg: 90, base: 110, days: '~5 dias', tier: '$$$$' },
};

function calculateVolume(length: number, width: number, height: number): number {
  return (length * width * height) / 5000; // peso volumétrico em kg
}

function calculateFreight(weightGrams: number, length: number, width: number, height: number): FreightResult[] {
  const weightKg = weightGrams / 1000;
  const volumetricKg = calculateVolume(length, width, height);
  const chargeableWeight = Math.max(weightKg, volumetricKg);

  return Object.entries(FREIGHT_RATES).map(([method, rate]) => ({
    method,
    days: rate.days,
    price: `R$ ${(rate.base + chargeableWeight * rate.perKg).toFixed(2)}`,
    tier: rate.tier,
  }));
}

export function FreightCalculator() {
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [results, setResults] = useState<FreightResult[]>([]);
  const [error, setError] = useState('');

  const handleCalculate = useCallback(() => {
    const w = parseFloat(weight);
    const l = parseFloat(length);
    const wi = parseFloat(width);
    const h = parseFloat(height);

    if (!w || w <= 0 || !l || l <= 0 || !wi || wi <= 0 || !h || h <= 0) {
      setError('Todos os campos devem ser maiores que zero');
      setResults([]);
      return;
    }

    setError('');
    setResults(calculateFreight(w, l, wi, h));
  }, [weight, length, width, height]);

  return (
    <section className={styles.section} id="calculadora">
      <div className={styles.container}>
        <span className={styles.eyebrow}>Calculadora</span>
        <h2 className={styles.title}>
          Estime o <span className={styles.accent}>custo do frete</span>
        </h2>
        <p className={styles.subtitle}>
          Simule o valor do envio antes de criar sua conta. Sem compromisso.
        </p>

        <div className={styles.calculator}>
          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="calc-weight" className={styles.label}>Peso (gramas)</label>
              <input
                id="calc-weight"
                type="number"
                className={styles.input}
                placeholder="Ex: 500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="1"
              />
            </div>
            <div className={styles.dimensions}>
              <div className={styles.field}>
                <label htmlFor="calc-length" className={styles.label}>Comp. (cm)</label>
                <input
                  id="calc-length"
                  type="number"
                  className={styles.input}
                  placeholder="30"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  min="1"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="calc-width" className={styles.label}>Larg. (cm)</label>
                <input
                  id="calc-width"
                  type="number"
                  className={styles.input}
                  placeholder="20"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="1"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="calc-height" className={styles.label}>Alt. (cm)</label>
                <input
                  id="calc-height"
                  type="number"
                  className={styles.input}
                  placeholder="15"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.calcButton} onClick={handleCalculate}>
              Calcular Frete
            </button>
          </div>

          {results.length > 0 && (
            <div className={styles.results}>
              <h3 className={styles.resultsTitle}>Estimativas de Frete</h3>
              <div className={styles.resultGrid}>
                {results.map((r) => (
                  <div key={r.method} className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultMethod}>{r.method}</span>
                      <span className={styles.resultTier}>{r.tier}</span>
                    </div>
                    <span className={styles.resultPrice}>{r.price}</span>
                    <span className={styles.resultDays}>{r.days}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Exporta para testes
export { calculateFreight, calculateVolume, FREIGHT_RATES };
