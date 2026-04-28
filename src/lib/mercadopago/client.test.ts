import { describe, it, expect } from 'vitest';
import { mpClient, mpPayment } from './client';
import { MercadoPagoConfig, Payment } from 'mercadopago';

describe('Mercado Pago Client Configuration', () => {
  it('deve inicializar o mpClient corretamente', () => {
    expect(mpClient).toBeInstanceOf(MercadoPagoConfig);
  });

  it('deve inicializar o mpPayment corretamente', () => {
    expect(mpPayment).toBeInstanceOf(Payment);
  });
});
