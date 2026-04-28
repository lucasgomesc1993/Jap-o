'use server';

import prisma from '@/lib/prisma/client';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { markPurchasedSchema, type MarkPurchasedInput } from '@/lib/validators/mark-purchased.schema';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';

export async function getAdminAwaitingPurchaseOrders(search?: string) {
  return await prisma.order.findMany({
    where: {
      status: { in: [OrderStatus.AWAITING_PURCHASE, OrderStatus.PURCHASED] },
      OR: search ? [
        { productName: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
      ] : undefined,
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function markOrderAsPurchased(orderId: string, data: MarkPurchasedInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Não autenticado');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado');
  }

  const validated = markPurchasedSchema.parse(data);

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PURCHASED,
      realPriceJpy: validated.realPriceJpy,
      arrivalExpectedAt: validated.arrivalExpectedAt,
      receiptUrl: validated.receiptUrl,
    },
  });

  await logAdminAction(
    authUser.id,
    'MARK_AS_PURCHASED',
    'ORDER',
    orderId,
    {
      realPriceJpy: validated.realPriceJpy,
      arrivalExpectedAt: validated.arrivalExpectedAt,
    }
  );

  revalidatePath('/admin/compras');
  return order;
}

export async function markOrderAsInTransit(orderId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Não autenticado');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Não autorizado');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== OrderStatus.PURCHASED) {
    throw new Error('Pedido deve estar no status COMPRADO para ser marcado como EM TRÂNSITO');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.IN_TRANSIT_TO_WAREHOUSE,
    },
  });

  await logAdminAction(
    authUser.id,
    'MARK_AS_IN_TRANSIT',
    'ORDER',
    orderId
  );

  revalidatePath('/admin/compras');
  return updatedOrder;
}
