import { describe, it, expect } from 'vitest';
import { manualTransactionSchema } from './manual-transaction.schema';

describe('manualTransactionSchema', () => {
  it('deve validar uma transação de crédito válida', () => {
    const data = {
      type: 'MANUAL_CREDIT',
      amount: 100.5,
      reason: 'Estorno de taxa duplicada',
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve validar uma transação de débito válida', () => {
    const data = {
      type: 'MANUAL_DEBIT',
      amount: 50,
      reason: 'Cobrança de serviço especial',
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar tipo inválido', () => {
    const data = {
      type: 'INVALID_TYPE',
      amount: 100,
      reason: 'Motivo qualquer',
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de transação inválido');
    }
  });

  it('deve rejeitar valor negativo ou zero', () => {
    const data = {
      type: 'MANUAL_CREDIT',
      amount: -10,
      reason: 'Motivo qualquer',
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O valor deve ser maior que zero');
    }
  });

  it('deve rejeitar motivo curto', () => {
    const data = {
      type: 'MANUAL_CREDIT',
      amount: 100,
      reason: 'Oi',
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O motivo deve ter pelo menos 5 caracteres');
    }
  });

  it('deve rejeitar motivo ausente', () => {
    const data = {
      type: 'MANUAL_CREDIT',
      amount: 100,
    };
    const result = manualTransactionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
