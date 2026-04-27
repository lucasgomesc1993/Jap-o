import { describe, it, expect } from 'vitest';
import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  it('aceita login válido', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'minhasenha',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita email vazio', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'minhasenha',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'invalido',
      password: 'minhasenha',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha é obrigatória');
    }
  });

  it('normaliza email para lowercase', () => {
    const result = loginSchema.parse({
      email: 'USER@EXAMPLE.COM',
      password: 'minhasenha',
    });
    expect(result.email).toBe('user@example.com');
  });
});
