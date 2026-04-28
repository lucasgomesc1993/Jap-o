import { describe, it, expect } from 'vitest';
import { formatCPF, formatCEP, formatPhone } from './formatters';

describe('formatters', () => {
  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('deve lidar com strings parciais', () => {
      expect(formatCPF('12345')).toBe('123.45');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatPhone('1144445555')).toBe('(11) 4444-5555');
    });

    it('deve formatar celular (11 dígitos)', () => {
      expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
    });
  });
});
