import { describe, it, expect } from 'vitest';
import { validateFile, MAX_FILE_SIZE } from './file-validation';

describe('file-validation', () => {
  it('deve validar arquivos corretos', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('deve rejeitar arquivos acima de 5MB', () => {
    const bigFile = new File([''], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigFile, 'size', { value: MAX_FILE_SIZE + 1 });
    
    const result = validateFile(bigFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5MB');
  });

  it('deve rejeitar formatos inválidos', () => {
    const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(pdfFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Formato');
  });
});
