import { describe, it, expect } from 'vitest';
import prisma from './client';
import { OrderStatus, TransactionType } from '@prisma/client';

describe('Prisma Schema Integration', () => {
  const testEmail = `test-${Date.now()}@nipponbox.com.br`;
  const testCpf = `test-${Date.now()}`;

  it('deve criar um usuário com endereço, carteira, pedido e transação', async () => {
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
            transactions: {
              create: {
                type: TransactionType.CREDIT,
                amount: 100.50,
                description: 'Carga inicial',
              }
            }
          },
        },
        orders: {
          create: {
            productUrl: 'https://amazon.co.jp/test',
            productName: 'Produto Teste',
            priceJpy: 1000,
            priceBrl: 40,
            serviceFee: 4,
            fixedFee: 20,
            totalBrl: 64,
            quantity: 1,
            status: OrderStatus.AWAITING_PURCHASE,
          }
        }
      },
      include: {
        addresses: true,
        wallet: {
          include: {
            transactions: true
          }
        },
        orders: true,
      },
    });

    expect(user.email).toBe(testEmail);
    expect(user.addresses).toHaveLength(1);
    expect(user.wallet?.balance.toString()).toBe('100.5');
    expect(user.wallet?.transactions).toHaveLength(1);
    expect(user.wallet?.transactions[0].type).toBe(TransactionType.CREDIT);
    expect(user.orders).toHaveLength(1);
    expect(user.orders[0].productName).toBe('Produto Teste');
    expect(user.orders[0].status).toBe(OrderStatus.AWAITING_PURCHASE);
  });

  it('deve validar que o saldo da carteira e valores do pedido são decimais corretos', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { wallet: true, orders: true }
    });

    expect(user?.wallet?.balance.toNumber()).toBe(100.5);
    expect(user?.orders[0].totalBrl.toNumber()).toBe(64);
  });

  it('deve permitir múltiplos pedidos para o mesmo usuário', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    await prisma.order.create({
      data: {
        userId: user!.id,
        productUrl: 'https://amazon.co.jp/test-2',
        productName: 'Produto Teste 2',
        priceJpy: 2000,
        priceBrl: 80,
        serviceFee: 8,
        fixedFee: 20,
        totalBrl: 108,
        quantity: 2,
      }
    });

    const orders = await prisma.order.findMany({
      where: { userId: user!.id }
    });

    expect(orders).toHaveLength(2);
  });

  it('deve deletar em cascata tudo ao remover o usuário', async () => {
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
    const orders = await prisma.order.findMany({
      where: { userId: user!.id }
    });

    expect(address).toBeNull();
    expect(wallet).toBeNull();
    expect(orders).toHaveLength(0);
  });
});
