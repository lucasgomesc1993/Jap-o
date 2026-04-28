import { describe, it, expect } from 'vitest';
import { paymentPixSchema } from './payment-pix.schema';

describe('Payment Pix Schema', () => {
  it('deve validar dados de pagamento corretos', () => {
    const validData = {
      amount: 150.50,
      description: 'Pagamento de Pedido #123',
      referenceId: 'order_123'
    };
    const result = paymentPixSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar valor zero ou negativo', () => {
    expect(paymentPixSchema.safeParse({ amount: 0, description: 'x', referenceId: 'y' }).success).toBe(false);
    expect(paymentPixSchema.safeParse({ amount: -10, description: 'x', referenceId: 'y' }).success).toBe(false);
  });

  it('deve exigir descrição e ID de referência', () => {
    expect(paymentPixSchema.safeParse({ amount: 10, description: '', referenceId: 'y' }).success).toBe(false);
    expect(paymentPixSchema.safeParse({ amount: 10, description: 'x', referenceId: '' }).success).toBe(false);
  });
});
