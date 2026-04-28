import { manualChargeSchema } from './manual-charge.schema';
import { describe, it, expect } from 'vitest';

describe('Manual Charge Schema', () => {
  it('valida dados corretos', () => {
    const result = manualChargeSchema.safeParse({ amount: 50.5, reason: 'Taxa extra de armazenamento' });
    expect(result.success).toBe(true);
  });

  it('rejeita valor negativo ou zero', () => {
    const result = manualChargeSchema.safeParse({ amount: 0, reason: 'Taxa' });
    expect(result.success).toBe(false);
  });

  it('rejeita motivo curto', () => {
    const result = manualChargeSchema.safeParse({ amount: 10, reason: 'A' });
    expect(result.success).toBe(false);
  });
});
