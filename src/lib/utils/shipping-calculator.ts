import { ShippingMethod } from '@prisma/client';

export interface RateRange {
  min: number;
  max: number;
  basePrice: number;
  pricePerGram: number;
}

// Configuração de frete por método e faixa de peso
// Valores baseados na Task 3.7 e estimativas de mercado Japão->Brasil
const RANGES: Record<ShippingMethod, RateRange[]> = {
  SAL: [
    { min: 0, max: 500, basePrice: 50, pricePerGram: 0.06 },
    { min: 500, max: 1000, basePrice: 80, pricePerGram: 0.05 },
    { min: 1000, max: 2000, basePrice: 130, pricePerGram: 0.035 },
    { min: 2000, max: 5000, basePrice: 200, pricePerGram: 0.05 },
    { min: 5000, max: 10000, basePrice: 450, pricePerGram: 0.035 },
    { min: 10000, max: 20000, basePrice: 800, pricePerGram: 0.03 },
    { min: 20000, max: 30000, basePrice: 1400, pricePerGram: 0.016 },
  ],
  EMS: [
    { min: 0, max: 500, basePrice: 100, pricePerGram: 0.12 },
    { min: 500, max: 1000, basePrice: 160, pricePerGram: 0.08 },
    { min: 1000, max: 2000, basePrice: 240, pricePerGram: 0.07 },
    { min: 2000, max: 5000, basePrice: 380, pricePerGram: 0.094 },
    { min: 5000, max: 10000, basePrice: 850, pricePerGram: 0.065 },
    { min: 10000, max: 20000, basePrice: 1500, pricePerGram: 0.055 },
    { min: 20000, max: 30000, basePrice: 2600, pricePerGram: 0.03 },
  ],
  DHL: [
    { min: 0, max: 500, basePrice: 150, pricePerGram: 0.2 },
    { min: 500, max: 1000, basePrice: 250, pricePerGram: 0.1 },
    { min: 1000, max: 2000, basePrice: 350, pricePerGram: 0.075 },
    { min: 2000, max: 5000, basePrice: 500, pricePerGram: 0.12 },
    { min: 5000, max: 10000, basePrice: 1100, pricePerGram: 0.08 },
    { min: 10000, max: 20000, basePrice: 1900, pricePerGram: 0.065 },
    { min: 20000, max: 30000, basePrice: 3200, pricePerGram: 0.033 },
  ],
  FEDEX: [
    { min: 0, max: 500, basePrice: 160, pricePerGram: 0.2 },
    { min: 500, max: 1000, basePrice: 260, pricePerGram: 0.1 },
    { min: 1000, max: 2000, basePrice: 360, pricePerGram: 0.08 },
    { min: 2000, max: 5000, basePrice: 520, pricePerGram: 0.126 },
    { min: 5000, max: 10000, basePrice: 1150, pricePerGram: 0.085 },
    { min: 10000, max: 20000, basePrice: 2000, pricePerGram: 0.065 },
    { min: 20000, max: 30000, basePrice: 3300, pricePerGram: 0.033 },
  ],
};

/**
 * Calcula o custo de frete baseado no método e peso (gramas)
 * Fórmula: basePrice + (weight * pricePerGram) por faixa
 */
export function calculateShippingCost(
  method: ShippingMethod, 
  weightGrams: number,
  customRates?: Record<ShippingMethod, RateRange[]>
): number {
  if (weightGrams <= 0) throw new Error('Peso deve ser maior que zero');
  if (weightGrams > 30000) throw new Error('Peso máximo permitido é 30kg');

  const methodRanges = customRates ? customRates[method] : RANGES[method];
  
  if (!methodRanges || methodRanges.length === 0) {
    throw new Error(`Nenhuma configuração de frete encontrada para o método ${method}`);
  }

  // Encontra a faixa adequada. Se o peso for exatamente o limite máximo da faixa, ele entra nela.
  const range = methodRanges.find(r => weightGrams > r.min && weightGrams <= r.max);

  if (!range) {
    throw new Error('Nenhuma faixa de peso encontrada para o valor informado');
  }

  const cost = range.basePrice + (weightGrams * range.pricePerGram);
  return Number(cost.toFixed(2));
}

/**
 * Calcula o custo do seguro baseado no valor declarado
 * Atualmente fixado em 2% do valor declarado
 */
export function calculateInsuranceCost(declaredValueBrl: number): number {
  if (declaredValueBrl < 0) return 0;
  return Number((declaredValueBrl * 0.02).toFixed(2));
}
