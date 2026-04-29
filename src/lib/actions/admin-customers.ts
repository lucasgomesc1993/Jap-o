'use server';

import prisma from '@/lib/prisma/client';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { manualTransactionSchema } from '@/lib/validators/manual-transaction.schema';
import { revalidatePath } from 'next/cache';
import { TransactionType } from '@prisma/client';

export async function getAdminCustomers(page = 1, search = '', pageSize = 10) {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        blocked: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: page,
    },
  };
}

export async function getAdminCustomerDetails(customerId: string) {
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      shipments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!customer) throw new Error('Cliente não encontrado');

  return customer;
}

export async function executeManualTransaction(
  adminId: string,
  customerId: string,
  formData: any
) {
  const validated = manualTransactionSchema.parse(formData);

  const wallet = await prisma.wallet.findUnique({
    where: { userId: customerId },
  });

  if (!wallet) throw new Error('Carteira não encontrada');

  const amount = validated.amount;

  return await prisma.$transaction(async (tx) => {
    if (validated.type === 'MANUAL_DEBIT') {
      if (wallet.balance.lessThan(amount)) {
        throw new Error('Saldo insuficiente para débito');
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });
    } else {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: validated.type as TransactionType,
        amount: amount,
        description: validated.reason,
      },
    });

    await logAdminAction(
      adminId,
      validated.type,
      'USER',
      customerId,
      { amount, reason: validated.reason, transactionId: transaction.id }
    );

    revalidatePath(`/admin/clientes/${customerId}`);
    return transaction;
  });
}

export async function toggleUserBlock(adminId: string, customerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!user) throw new Error('Usuário não encontrado');

  const newStatus = !user.blocked;

  const updatedUser = await prisma.user.update({
    where: { id: customerId },
    data: { blocked: newStatus },
  });

  await logAdminAction(
    adminId,
    newStatus ? 'BLOCK_USER' : 'UNBLOCK_USER',
    'USER',
    customerId,
    { previousStatus: user.blocked, newStatus }
  );

  revalidatePath('/admin/clientes');
  revalidatePath(`/admin/clientes/${customerId}`);

  return updatedUser;
}
