import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import prisma from '@/lib/prisma/client';
import { processDailyStorageFees } from './admin-storage-fees';

// Mock do e-mail
vi.mock('@/lib/email/service', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('processDailyStorageFees Action', () => {
  let userId: string;
  const storageFeePerDay = 5.00;

  beforeAll(async () => {
    // Setup SystemConfig
    await prisma.systemConfig.upsert({
      where: { id: 'CURRENT' },
      update: { storageFeePerDay },
      create: { 
        id: 'CURRENT', 
        storageFeePerDay,
        serviceFeePercent: 10,
        fixedFeeBrl: 30,
        jpyExchangeRate: 0.035
      }
    });

    // Setup user with wallet
    const user = await prisma.user.create({
      data: {
        email: `storage-test-${Date.now()}@nipponbox.com.br`,
        fullName: 'Storage Tester',
        cpf: `cpf-st-${Date.now()}`,
        wallet: {
          create: {
            balance: 100.00
          }
        }
      },
      include: {
        wallet: true
      }
    });

    userId = user.id;
  });

  afterAll(async () => {
    // Limpeza pesada para evitar resíduos em testes paralelos (se houver)
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
    if (user?.wallet) {
      await prisma.transaction.deleteMany({ where: { walletId: user.wallet.id } });
    }
    await prisma.warehouseItem.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('deve cobrar taxa de armazenamento para item vencido', async () => {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 1); // Garante que é no passado mas próximo

    const item = await prisma.warehouseItem.create({
      data: {
        userId,
        name: 'Item Vencido Teste',
        status: 'AVAILABLE',
        freeStorageDeadline: yesterday,
      }
    });

    const result = await processDailyStorageFees();

    expect(result.success).toBe(true);
    // Como rodamos em um banco que pode ter outros itens, verificamos se o nosso foi processado
    // Buscando a transação específica
    const updatedWallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    
    const transaction = await prisma.transaction.findFirst({
      where: { 
        walletId: updatedWallet!.id,
        type: 'STORAGE_FEE',
        referenceId: item.id
      }
    });
    
    expect(transaction).toBeDefined();
    expect(Number(transaction?.amount)).toBe(storageFeePerDay);
    expect(Number(updatedWallet?.balance)).toBe(95.00);

    // Verificar se o campo lastStorageFeeAt foi preenchido
    const updatedItem = await prisma.warehouseItem.findUnique({ where: { id: item.id } });
    expect(updatedItem?.lastStorageFeeAt).toBeDefined();
    expect(updatedItem?.lastStorageFeeAt).not.toBeNull();
  });

  it('deve ser idempotente (não cobrar duas vezes no mesmo dia)', async () => {
    // Rodar novamente a função
    const result = await processDailyStorageFees();
    
    // O item do teste anterior já foi cobrado hoje, então o count de sucessos
    // para itens novos deve ser 0 (considerando apenas o nosso contexto)
    // Mas para ser preciso, verificamos o saldo novamente
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(wallet?.balance)).toBe(95.00); // Permanece o mesmo
  });

  it('não deve cobrar item que ainda está no prazo gratuito', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.warehouseItem.create({
      data: {
        userId,
        name: 'Item no Prazo',
        status: 'AVAILABLE',
        freeStorageDeadline: tomorrow
      }
    });

    const initialBalance = 95.00;
    await processDailyStorageFees();

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(wallet?.balance)).toBe(initialBalance);
  });

  it('não deve cobrar item que já foi enviado (SHIPPED)', async () => {
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - 10);

    await prisma.warehouseItem.create({
      data: {
        userId,
        name: 'Item Enviado',
        status: 'SHIPPED',
        freeStorageDeadline: longAgo
      }
    });

    const initialBalance = 95.00;
    await processDailyStorageFees();

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(wallet?.balance)).toBe(initialBalance);
  });

  it('deve permitir saldo negativo (débito pendente)', async () => {
    // Forçar saldo zero
    await prisma.wallet.update({
      where: { userId },
      data: { balance: 0 }
    });

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 1);

    await prisma.warehouseItem.create({
      data: {
        userId,
        name: 'Item Dívida',
        status: 'AVAILABLE',
        freeStorageDeadline: yesterday
      }
    });

    await processDailyStorageFees();

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(wallet?.balance)).toBe(-5.00);
  });
});
