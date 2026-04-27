import { describe, it, expect } from 'vitest';
import { addressSchema } from './address.schema';

const validAddress = {
  label: 'Casa',
  cep: '01001-000',
  street: 'Praça da Sé',
  number: '123',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP' as const,
  isDefault: true,
};

describe('addressSchema', () => {
  it('aceita endereço válido', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('aceita endereço com complemento', () => {
    const result = addressSchema.safeParse({ ...validAddress, complement: 'Apto 101' });
    expect(result.success).toBe(true);
  });

  it('aceita endereço sem complemento', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('rejeita sem label', () => {
    const result = addressSchema.safeParse({ ...validAddress, label: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita sem rua', () => {
    const result = addressSchema.safeParse({ ...validAddress, street: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita sem número', () => {
    const result = addressSchema.safeParse({ ...validAddress, number: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita sem bairro', () => {
    const result = addressSchema.safeParse({ ...validAddress, neighborhood: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita sem cidade', () => {
    const result = addressSchema.safeParse({ ...validAddress, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita estado inválido', () => {
    const result = addressSchema.safeParse({ ...validAddress, state: 'XX' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'Estado inválido')).toBe(true);
    }
  });

  it('aceita todos os estados brasileiros', () => {
    const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    states.forEach((state) => {
      const result = addressSchema.safeParse({ ...validAddress, state });
      expect(result.success).toBe(true);
    });
  });

  it('isDefault é false por padrão', () => {
    const { isDefault: _, ...withoutDefault } = validAddress;
    const result = addressSchema.parse(withoutDefault);
    expect(result.isDefault).toBe(false);
  });
});
