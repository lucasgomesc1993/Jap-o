import { z } from 'zod';

/**
 * Valida CPF brasileiro (11 dígitos, com ou sem formatação).
 * Verifica dígitos verificadores.
 */
function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Rejeita sequências repetidas
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Verifica primeiro dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  // Verifica segundo dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

export const cpfSchema = z
  .string({ required_error: 'CPF é obrigatório' })
  .min(1, 'CPF é obrigatório')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 11, {
    message: 'CPF deve conter 11 dígitos',
  })
  .refine(isValidCpf, {
    message: 'CPF inválido',
  });

export { isValidCpf };
