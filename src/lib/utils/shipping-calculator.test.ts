import { describe, it, expect } from 'vitest';
import { calculateShippingCost, calculateInsuranceCost } from './shipping-calculator';
import { ShippingMethod } from '@prisma/client';

describe('shipping-calculator', () => {
  describe('calculateShippingCost', () => {
    it('deve calcular corretamente para o método SAL em diferentes faixas', () => {
      // Faixa 0-500g: 50 + 250 * 0.06 = 50 + 15 = 65
      expect(calculateShippingCost('SAL', 250)).toBe(65);
      
      // Faixa 500-1000g: 80 + 750 * 0.05 = 80 + 37.5 = 117.5
      expect(calculateShippingCost('SAL', 750)).toBe(117.5);
      
      // Faixa 1000-2000g: 130 + 1500 * 0.035 = 130 + 52.5 = 182.5
      expect(calculateShippingCost('SAL', 1500)).toBe(182.5);
    });

    it('deve calcular corretamente para o método EMS', () => {
      // Faixa 0-500g: 100 + 250 * 0.12 = 100 + 30 = 130
      expect(calculateShippingCost('EMS', 250)).toBe(130);
    });

    it('deve usar a faixa correta no limite (exatamente no max da faixa)', () => {
      // SAL 500g: deve cair na faixa 0-500g
      // 50 + 500 * 0.06 = 50 + 30 = 80
      expect(calculateShippingCost('SAL', 500)).toBe(80);

      // SAL 501g: deve cair na faixa 500-1000g
      // 80 + 501 * 0.05 = 80 + 25.05 = 105.05
      expect(calculateShippingCost('SAL', 501)).toBe(105.05);
    });

    it('deve lançar erro para peso zero ou negativo', () => {
      expect(() => calculateShippingCost('SAL', 0)).toThrow('Peso deve ser maior que zero');
      expect(() => calculateShippingCost('SAL', -10)).toThrow('Peso deve ser maior que zero');
    });

    it('deve lançar erro para peso acima de 30kg', () => {
      expect(() => calculateShippingCost('SAL', 30001)).toThrow('Peso máximo permitido é 30kg');
    });

    it('deve calcular corretamente para todas as faixas do SAL', () => {
      const cases = [
        { weight: 250, expected: 65 },     // 0-500: 50 + 250 * 0.06
        { weight: 750, expected: 117.5 },  // 500-1000: 80 + 750 * 0.05
        { weight: 1500, expected: 182.5 }, // 1000-2000: 130 + 1500 * 0.035
        { weight: 3000, expected: 350 },   // 2000-5000: 200 + 3000 * 0.05
        { weight: 7500, expected: 712.5 }, // 5000-10000: 450 + 7500 * 0.035
        { weight: 15000, expected: 1250 }, // 10000-20000: 800 + 15000 * 0.03
        { weight: 25000, expected: 1800 }, // 20000-30000: 1400 + 25000 * 0.016
      ];

      cases.forEach(({ weight, expected }) => {
        expect(calculateShippingCost('SAL', weight)).toBe(expected);
      });
    });

    it('deve calcular corretamente para os outros métodos (DHL e FEDEX)', () => {
      // DHL 1000g: 250 + 1000 * 0.1 = 350
      expect(calculateShippingCost('DHL', 1000)).toBe(350);
      
      // FEDEX 1000g: 260 + 1000 * 0.1 = 360
      expect(calculateShippingCost('FEDEX', 1000)).toBe(360);
    });
  });

  describe('calculateInsuranceCost', () => {
    it('deve calcular 2% do valor declarado', () => {
      expect(calculateInsuranceCost(100)).toBe(2);
      expect(calculateInsuranceCost(1500)).toBe(30);
      expect(calculateInsuranceCost(55.5)).toBe(1.11);
    });

    it('deve retornar zero para valores negativos', () => {
      expect(calculateInsuranceCost(-100)).toBe(0);
    });
  });
});
