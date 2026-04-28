import { describe, it, expect } from 'vitest';
import { userRegisterSchema } from './user-register.schema';

describe('userRegisterSchema', () => {
  const validData = {
    fullName: 'Lucas Gomes',
    email: 'lucas@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    cpf: '529.982.247-25',
    phone: '(11) 99999-8888',
  };

  it('deve validar dados corretos', () => {
    const result = userRegisterSchema.safeParse(validData);
    if (!result.success) {
      console.log('Validation Errors:', result.error.format());
    }
    expect(result.success).toBe(true);
  });

  it('deve rejeitar senhas que não conferem', () => {
    const result = userRegisterSchema.safeParse({
      ...validData,
      confirmPassword: 'DifferentPassword123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passError = result.error.issues.find(i => i.path.includes('confirmPassword'));
      expect(passError?.message).toBe('Senhas não conferem');
    }
  });

  it('deve rejeitar nome muito curto', () => {
    const result = userRegisterSchema.safeParse({
      ...validData,
      fullName: 'Lu',
    });
    expect(result.success).toBe(false);
  });
});
