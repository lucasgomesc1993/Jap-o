import { describe, it, expect } from 'vitest';
import { walletAddCreditSchema } from './wallet-add-credit.schema';

describe('Wallet Add Credit Schema', () => {
  it('deve validar valor de recarga correto (>= 10)', () => {
    expect(walletAddCreditSchema.safeParse({ amount: 10 }).success).toBe(true);
    expect(walletAddCreditSchema.safeParse({ amount: 50.75 }).success).toBe(true);
  });

  it('deve rejeitar valor abaixo do mínimo (R$ 10)', () => {
    const result = walletAddCreditSchema.safeParse({ amount: 9.99 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('O valor mínimo para recarga é R$ 10,00');
    }
  });

  it('deve rejeitar valores negativos', () => {
    expect(walletAddCreditSchema.safeParse({ amount: -50 }).success).toBe(false);
  });
});
