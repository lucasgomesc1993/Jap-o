import { describe, it, expect, vi } from 'vitest';

describe('Prisma Client Singleton', () => {
  it('deve reutilizar a instância em desenvolvimento', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Importa dinamicamente para forçar a execução do arquivo
    const mod1 = await import('./client?dev=1');
    const prisma1 = mod1.default;
    
    const mod2 = await import('./client?dev=2');
    const prisma2 = mod2.default;
    
    expect(prisma1).toBe(prisma2);
    expect(globalThis.prisma).toBe(prisma1);
    
    process.env.NODE_ENV = originalEnv;
  });

  it('não deve salvar no globalThis em produção', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete (globalThis as any).prisma;
    
    const mod = await import('./client?prod=1');
    expect(mod.default).toBeDefined();
    expect((globalThis as any).prisma).toBeUndefined();
    
    process.env.NODE_ENV = originalEnv;
  });
});
