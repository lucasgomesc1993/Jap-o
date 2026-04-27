import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FreightCalculator, calculateFreight, calculateVolume } from './FreightCalculator';

describe('FreightCalculator Component', () => {
  it('renderiza os campos de input', () => {
    render(<FreightCalculator />);
    expect(screen.getByLabelText('Peso (gramas)')).toBeInTheDocument();
    expect(screen.getByLabelText('Comp. (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Larg. (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Alt. (cm)')).toBeInTheDocument();
  });

  it('mostra erro quando inputs são <= 0', () => {
    render(<FreightCalculator />);
    fireEvent.click(screen.getByText('Calcular Frete'));
    expect(screen.getByText('Todos os campos devem ser maiores que zero')).toBeInTheDocument();
  });

  it('exibe resultados com 4 métodos após cálculo válido', () => {
    render(<FreightCalculator />);
    fireEvent.change(screen.getByLabelText('Peso (gramas)'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Comp. (cm)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Larg. (cm)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Alt. (cm)'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Calcular Frete'));

    expect(screen.getByText('SAL')).toBeInTheDocument();
    expect(screen.getByText('EMS')).toBeInTheDocument();
    expect(screen.getByText('DHL')).toBeInTheDocument();
    expect(screen.getByText('FedEx')).toBeInTheDocument();
  });
});

describe('calculateFreight', () => {
  it('calcula corretamente para todos os métodos', () => {
    const results = calculateFreight(1000, 30, 20, 15);
    expect(results).toHaveLength(4);
    results.forEach((r) => {
      expect(r.method).toBeTruthy();
      expect(r.price).toMatch(/^R\$ /);
      expect(r.days).toBeTruthy();
    });
  });

  it('usa peso volumétrico quando maior que peso real', () => {
    // Peso real: 0.2kg, volumétrico: 60*40*30/5000 = 14.4kg
    const results = calculateFreight(200, 60, 40, 30);
    // SAL: 45 + 14.4*28 = 448.20
    const sal = results.find((r) => r.method === 'SAL');
    expect(sal?.price).toBe('R$ 448.20');
  });
});

describe('calculateVolume', () => {
  it('calcula peso volumétrico corretamente', () => {
    expect(calculateVolume(30, 20, 15)).toBe(1.8);
  });
});
