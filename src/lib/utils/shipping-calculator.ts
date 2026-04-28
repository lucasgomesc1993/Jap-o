import { ShippingMethod } from '@prisma/client';

export interface ShippingRates {
  [key: string]: {
    [weightRange: string]: number;
  };
}

// Preços fictícios baseados na Task 3.7
const RATES: Record<ShippingMethod, Record<string, number>> = {
  SAL: {
    '500': 80,
    '1000': 130,
    '2000': 200,
    '5000': 450,
    '10000': 800,
    '20000': 1400,
    '30000': 1900,
  },
  EMS: {
    '500': 160,
    '1000': 240,
    '2000': 380,
    '5000': 850,
    '10000': 1500,
    '20000': 2600,
    '30000': 3500,
  },
  DHL: {
    '500': 250,
    '1000': 350,
    '2000': 500,
    '5000': 1100,
    '10000': 1900,
    '20000': 3200,
    '30000': 4200,
  },
  FEDEX: {
    '500': 260,
    '1000': 360,
    '2000': 520,
    '5000': 1150,
    '10000': 2000,
    '20000': 3300,
    '30000': 4300,
  },
};

export function calculateShippingCost(method: ShippingMethod, weightGrams: number): number {
  if (weightGrams <= 0) throw new Error('Peso deve ser maior que zero');
  if (weightGrams > 30000) throw new Error('Peso máximo permitido é 30kg');

  const methodRates = RATES[method];
  const weights = Object.keys(methodRates).map(Number).sort((a, b) => a - b);
  
  const applicableWeight = weights.find(w => weightGrams <= w);
  
  if (!applicableWeight) {
    throw new Error('Peso acima do limite calculado');
  }

  return methodRates[applicableWeight.toString()];
}

export function calculateInsuranceCost(declaredValueBrl: number): number {
  // Exemplo: 2% do valor declarado
  return Number((declaredValueBrl * 0.02).toFixed(2));
}
