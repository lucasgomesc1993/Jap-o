import { resend } from '../email/client';
import { WelcomeEmail } from '../email/templates/WelcomeEmail';
import { OrderCreatedEmail } from '../email/templates/OrderCreatedEmail';
import { OrderPurchasedEmail } from '../email/templates/OrderPurchasedEmail';
import { ItemArrivedEmail } from '../email/templates/ItemArrivedEmail';
import { StorageWarningEmail } from '../email/templates/StorageWarningEmail';
import { StorageFeeEmail } from '../email/templates/StorageFeeEmail';
import { ShipmentPaidEmail } from '../email/templates/ShipmentPaidEmail';
import { TrackingCodeEmail } from '../email/templates/TrackingCodeEmail';
import { SupportReplyEmail } from '../email/templates/SupportReplyEmail';
import React from 'react';

const FROM_EMAIL = 'NipponBox <onboarding@resend.dev>';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export const notifications = {
  async sendWelcome(to: string, userFirstname: string) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Bem-vindo à NipponBox!',
      react: React.createElement(WelcomeEmail, { userFirstname }),
    }));
  },

  async notifyOrderCreated(to: string, data: { customerName: string; orderId: string; productName: string; orderUrl: string }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Pedido Recebido - #${data.orderId.slice(0, 8)}`,
      react: React.createElement(OrderCreatedEmail, data),
    }));
  },

  async notifyOrderPurchased(to: string, data: { customerName: string; orderId: string; productName: string }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Seu Produto foi Comprado! - #${data.orderId.slice(0, 8)}`,
      react: React.createElement(OrderPurchasedEmail, data),
    }));
  },

  async notifyItemArrived(to: string, data: { customerName: string; productName: string; weightGrams: number; deadline: string }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Seu item chegou no armazém!',
      react: React.createElement(ItemArrivedEmail, data),
    }));
  },

  async notifyStorageWarning(to: string, data: { customerName: string; productName: string; daysRemaining: number }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Atenção: Prazo de armazenamento grátis expirando',
      react: React.createElement(StorageWarningEmail, data),
    }));
  },

  async notifyStorageFee(to: string, data: { userName: string; itemName: string; feeAmount: string; daysExceeded: number }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Cobrança de Armazenamento',
      react: React.createElement(StorageFeeEmail, data),
    }));
  },

  async notifyShipmentPaid(to: string, data: { customerName: string; shipmentId: string; trackingMethod: string; itemsCount: number }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Pagamento Confirmado - Envio #${data.shipmentId.slice(0, 8)}`,
      react: React.createElement(ShipmentPaidEmail, data),
    }));
  },

  async notifyTrackingAvailable(to: string, data: { customerName: string; shipmentId: string; trackingCode: string; trackingUrl: string }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Código de Rastreio Disponível - Envio #${data.shipmentId.slice(0, 8)}`,
      react: React.createElement(TrackingCodeEmail, data),
    }));
  },

  async notifySupportReply(to: string, data: { customerName: string; ticketId: string; ticketSubject: string; messagePreview: string; ticketUrl: string }) {
    return withRetry(() => resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Nova resposta no chamado: ${data.ticketSubject}`,
      react: React.createElement(SupportReplyEmail, data),
    }));
  },
};
