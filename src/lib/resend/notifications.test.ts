import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from './send-notification';
import { resend } from '../email/client';
import { render } from '@react-email/render';
import React from 'react';
import { WelcomeEmail } from '../email/templates/WelcomeEmail';
import { OrderCreatedEmail } from '../email/templates/OrderCreatedEmail';
import { OrderPurchasedEmail } from '../email/templates/OrderPurchasedEmail';
import { ItemArrivedEmail } from '../email/templates/ItemArrivedEmail';
import { StorageWarningEmail } from '../email/templates/StorageWarningEmail';
import { StorageFeeEmail } from '../email/templates/StorageFeeEmail';
import { ShipmentPaidEmail } from '../email/templates/ShipmentPaidEmail';
import { TrackingCodeEmail } from '../email/templates/TrackingCodeEmail';
import { SupportReplyEmail } from '../email/templates/SupportReplyEmail';

// Mock resend
vi.mock('../email/client', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null, headers: null }),
    },
  },
}));

describe('Notification Service & Email Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Templates Rendering', () => {
    it('should render WelcomeEmail correctly', async () => {
      const html = await render(React.createElement(WelcomeEmail, { userFirstname: 'Lucas' }));
      expect(html).toContain('Konnichiwa');
      expect(html).toContain('Lucas');
      expect(html).toContain('BC002D'); // Brand color
    });

    it('should render OrderCreatedEmail correctly', async () => {
      const html = await render(React.createElement(OrderCreatedEmail, {
        customerName: 'Lucas',
        orderId: 'order-123',
        productName: 'Action Figure',
        orderUrl: 'https://test.com',
      }));
      expect(html).toContain('Action Figure');
      expect(html).toContain('order-123');
    });

    it('should render OrderPurchasedEmail correctly', async () => {
      const html = await render(React.createElement(OrderPurchasedEmail, {
        customerName: 'Lucas',
        orderId: 'order-123',
        productName: 'Action Figure',
      }));
      expect(html).toContain('foi adquirido com sucesso');
      expect(html).toContain('Action Figure');
    });

    it('should render ItemArrivedEmail correctly', async () => {
      const html = await render(React.createElement(ItemArrivedEmail, {
        customerName: 'Lucas',
        productName: 'Action Figure',
        weightGrams: 500,
        deadline: '2024-05-10',
      }));
      expect(html).toContain('500');
      expect(html).toContain('g');
      expect(html).toContain('2024-05-10');
    });

    it('should render StorageWarningEmail correctly', async () => {
      const html = await render(React.createElement(StorageWarningEmail, {
        customerName: 'Lucas',
        productName: 'Action Figure',
        daysRemaining: 7,
      }));
      expect(html).toContain('7');
      expect(html).toContain('dias');
      expect(html).toContain('armazenamento gratuito do seu item');
    });

    it('should render StorageFeeEmail correctly', async () => {
      const html = await render(React.createElement(StorageFeeEmail, {
        userName: 'Lucas',
        itemName: 'Action Figure',
        feeAmount: 'R$ 10,00',
        daysExceeded: 1,
      }));
      expect(html).toContain('R$ 10,00');
      expect(html).toContain('1');
      expect(html).toContain('dia');
    });

    it('should render ShipmentPaidEmail correctly', async () => {
      const html = await render(React.createElement(ShipmentPaidEmail, {
        customerName: 'Lucas',
        shipmentId: 'ship-123',
        trackingMethod: 'EMS',
        itemsCount: 3,
      }));
      expect(html).toContain('ship-123');
      expect(html).toContain('EMS');
      expect(html).toContain('3');
    });

    it('should render TrackingCodeEmail correctly', async () => {
      const html = await render(React.createElement(TrackingCodeEmail, {
        customerName: 'Lucas',
        shipmentId: 'ship-123',
        trackingCode: 'TR123456789JP',
        trackingUrl: 'https://tracking.com',
      }));
      expect(html).toContain('TR123456789JP');
    });

    it('should render SupportReplyEmail correctly', async () => {
      const html = await render(React.createElement(SupportReplyEmail, {
        customerName: 'Lucas',
        ticketId: 'ticket-123',
        ticketSubject: 'Dúvida sobre frete',
        messagePreview: 'Olá, seu frete foi...',
        ticketUrl: 'https://test.com',
      }));
      expect(html).toContain('Dúvida sobre frete');
      expect(html).toContain('Olá, seu frete foi...');
    });
  });

  describe('Service Logic', () => {
    it('should send welcome email', async () => {
      await notifications.sendWelcome('test@test.com', 'Lucas');
      expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@test.com',
        subject: 'Bem-vindo à NipponBox!',
      }));
    });

    it('should retry on failure', async () => {
      vi.mocked(resend.emails.send)
        .mockRejectedValueOnce(new Error('Resend error'))
        .mockResolvedValueOnce({ data: { id: 'success' }, error: null, headers: null });

      const result = await notifications.sendWelcome('test@test.com', 'Lucas');
      
      expect(resend.emails.send).toHaveBeenCalledTimes(2);
      expect(result.data?.id).toBe('success');
    }, 15000);

    it('should fail after max retries', async () => {
      vi.mocked(resend.emails.send).mockRejectedValue(new Error('Resend error'));

      await expect(notifications.sendWelcome('test@test.com', 'Lucas')).rejects.toThrow('Resend error');
      expect(resend.emails.send).toHaveBeenCalledTimes(3);
    }, 15000);
  });
});
