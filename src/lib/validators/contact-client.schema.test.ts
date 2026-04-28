import { contactClientSchema } from './contact-client.schema';
import { describe, it, expect } from 'vitest';

describe('Contact Client Schema', () => {
  it('valida dados corretos', () => {
    const result = contactClientSchema.safeParse({ subject: 'Aviso Importante', message: 'Por favor, verifique seu item no armazém.' });
    expect(result.success).toBe(true);
  });

  it('rejeita assunto curto', () => {
    const result = contactClientSchema.safeParse({ subject: 'A', message: 'Mensagem válida aqui.' });
    expect(result.success).toBe(false);
  });

  it('rejeita mensagem curta', () => {
    const result = contactClientSchema.safeParse({ subject: 'Assunto', message: 'Curta' });
    expect(result.success).toBe(false);
  });
});
