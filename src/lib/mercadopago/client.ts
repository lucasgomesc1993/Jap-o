import { MercadoPagoConfig, Payment } from 'mercadopago';

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN não está definido');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

export const mpPayment = new Payment(mpClient);
