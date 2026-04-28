import { extendDeadlineSchema } from './extend-deadline.schema';
import { describe, it, expect } from 'vitest';

describe('Extend Deadline Schema', () => {
  it('valida dados corretos', () => {
    const result = extendDeadlineSchema.safeParse({ days: 10, reason: 'Atraso na liberação' });
    expect(result.success).toBe(true);
  });

  it('rejeita dias menores que 1', () => {
    const result = extendDeadlineSchema.safeParse({ days: 0, reason: 'Motivo' });
    expect(result.success).toBe(false);
  });

  it('rejeita motivo curto', () => {
    const result = extendDeadlineSchema.safeParse({ days: 5, reason: 'A' });
    expect(result.success).toBe(false);
  });
});
