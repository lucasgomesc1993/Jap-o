import { describe, it, expect } from 'vitest';
import { ticketMessageSchema } from './ticket-message.schema';

describe('ticketMessageSchema', () => {
  it('should validate a correct message', () => {
    const data = {
      ticketId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Minha resposta para o suporte',
    };
    const result = ticketMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty message', () => {
    const data = {
      ticketId: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    };
    const result = ticketMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mensagem não pode estar vazia');
    }
  });

  it('should reject too many attachments', () => {
    const data = {
      ticketId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Veja as fotos',
      attachments: ['1', '2', '3', '4', '5', '6'],
    };
    const result = ticketMessageSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('No máximo 5 fotos permitidas');
    }
  });
});
