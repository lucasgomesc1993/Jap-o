import { describe, it, expect } from 'vitest';
import { ticketCreateSchema } from './ticket-create.schema';

describe('ticketCreateSchema', () => {
  it('should validate a correct ticket creation', () => {
    const data = {
      type: 'ITEM_ISSUE',
      subject: 'Problema com meu item',
      content: 'O item chegou com defeito na caixa.',
      orderId: '550e8400-e29b-41d4-a716-446655440000',
    };
    const result = ticketCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject subject too short', () => {
    const data = {
      type: 'OTHER',
      subject: 'Erro',
      content: 'Conteúdo válido com mais de dez caracteres',
    };
    const result = ticketCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Assunto deve ter pelo menos 5 caracteres');
    }
  });

  it('should reject more than 5 attachments', () => {
    const data = {
      type: 'OTHER',
      subject: 'Assunto válido',
      content: 'Conteúdo válido com mais de dez caracteres',
      attachments: ['1', '2', '3', '4', '5', '6'],
    };
    const result = ticketCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('No máximo 5 fotos permitidas');
    }
  });

  it('should allow optional orderId and shipmentId', () => {
    const data = {
      type: 'BILLING',
      subject: 'Problema no pagamento',
      content: 'Não consegui pagar meu boleto hoje.',
    };
    const result = ticketCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
