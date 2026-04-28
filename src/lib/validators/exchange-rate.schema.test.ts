import { describe, it, expect } from 'vitest';
import { exchangeRateApiSchema } from './exchange-rate.schema';

describe('Exchange Rate API Schema', () => {
  const validApiResponse = {
    JPYBRL: {
      code: 'JPY',
      codein: 'BRL',
      name: 'Iene Japonês/Real Brasileiro',
      high: '0.0354',
      low: '0.0351',
      varBid: '0.0001',
      pctChange: '0.28',
      bid: '0.0353',
      ask: '0.0353',
      timestamp: '1714290000',
      create_date: '2026-04-28 10:00:00'
    }
  };

  it('deve validar resposta da API correta', () => {
    const result = exchangeRateApiSchema.safeParse(validApiResponse);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar se faltar campos obrigatórios', () => {
    const invalid = { JPYBRL: { bid: '0.0353' } };
    expect(exchangeRateApiSchema.safeParse(invalid).success).toBe(false);
  });

  it('deve rejeitar se a estrutura estiver incorreta', () => {
    const invalid = { JPY_BRL: { ...validApiResponse.JPYBRL } };
    expect(exchangeRateApiSchema.safeParse(invalid).success).toBe(false);
  });
});
