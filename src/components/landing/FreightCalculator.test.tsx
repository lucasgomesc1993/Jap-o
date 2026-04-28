import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FreightCalculator } from './FreightCalculator';

describe('FreightCalculator Component', () => {
  it('renderiza os campos de input', () => {
    render(<FreightCalculator />);
    expect(screen.getByLabelText(/Peso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comp./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Larg./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alt./i)).toBeInTheDocument();
  });

  it('mostra erro quando inputs são <= 0', () => {
    render(<FreightCalculator />);
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/Comp./i), { target: { value: '0' } });
    fireEvent.click(screen.getByText(/Calcular Frete/i));
    expect(screen.getByText('Todos os campos devem ser maiores que zero')).toBeInTheDocument();
  });

  it('exercita todos os handlers de dimensões', () => {
    render(<FreightCalculator />);
    fireEvent.change(screen.getByLabelText(/Comp./i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Larg./i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/Alt./i), { target: { value: '10' } });
    
    expect(screen.getByLabelText(/Comp./i)).toHaveValue(20);
    expect(screen.getByLabelText(/Larg./i)).toHaveValue(15);
    expect(screen.getByLabelText(/Alt./i)).toHaveValue(10);
  });

  it('exibe resultados com 4 métodos após cálculo válido', () => {
    render(<FreightCalculator />);
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Comp./i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Larg./i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Alt./i), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText(/Calcular Frete/i));
    
    expect(screen.getByText('SAL')).toBeInTheDocument();
    expect(screen.getByText('EMS')).toBeInTheDocument();
    expect(screen.getByText('DHL')).toBeInTheDocument();
    expect(screen.getByText('FedEx')).toBeInTheDocument();
  });

  it('calcula corretamente para todos os métodos', () => {
    render(<FreightCalculator />);
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: '2000' } }); // 2kg
    fireEvent.change(screen.getByLabelText(/Comp./i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Larg./i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Alt./i), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText(/Calcular Frete/i));

    // Base 2kg: 
    // SAL: 45 + 2*28 = 101
    // EMS: 120 + 2*55 = 230
    // DHL: 250 + 2*80 = 410
    // FedEx: 230 + 2*75 = 380
    expect(screen.getByText('R$ 101.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 230.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 410.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 380.00')).toBeInTheDocument();
  });

  it('usa peso volumétrico quando maior que peso real', () => {
    render(<FreightCalculator />);
    // Peso real: 1kg (1000g)
    // Dimensões: 50x50x50 = 125.000 / 5000 = 25kg volumétrico
    fireEvent.change(screen.getByLabelText(/Peso/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Comp./i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Larg./i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Alt./i), { target: { value: '50' } });
    
    fireEvent.click(screen.getByText(/Calcular Frete/i));

    // Base 25kg (SAL: 45 + 25 * 28 = 45 + 700 = 745)
    expect(screen.getByText('R$ 745.00')).toBeInTheDocument();
  });
});
