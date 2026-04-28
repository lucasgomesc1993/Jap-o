import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from './client';

describe('Prisma Schema Integration', () => {
  const testEmail = `test-${Date.now()}@nipponbox.com.br`;
  const testCpf = `test-${Date.now()}`;

  it('deve criar um usuário com endereço e carteira vinculada', async () => {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Usuário de Teste',
        cpf: testCpf,
        addresses: {
          create: {
            cep: '01001000',
            street: 'Rua Teste',
            number: '123',
            neighborhood: 'Bairro Teste',
            city: 'São Paulo',
            state: 'SP',
          },
        },
        wallet: {
          create: {
            balance: 100.50,
          },
        },
      },
      include: {
        addresses: true,
        wallet: true,
      },
    });

    expect(user.email).toBe(testEmail);
    expect(user.addresses).toHaveLength(1);
    expect(user.wallet?.balance.toString()).toBe('100.5');
  });

  it('deve deletar em cascata o endereço e carteira ao remover o usuário', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    await prisma.user.delete({
      where: { id: user!.id },
    });

    const address = await prisma.address.findFirst({
      where: { userId: user!.id },
    });
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user!.id },
    });

    expect(address).toBeNull();
    expect(wallet).toBeNull();
  });
});
