'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { orderCreateSchema, type OrderCreateInput } from '@/lib/validators/order-create.schema';
import { getExchangeRate } from '@/lib/utils/exchange-rate';
import { revalidatePath } from 'next/cache';

const SERVICE_FEE_PERCENT = 0.10;
const FIXED_FEE_BRL = 20.00;

export async function createOrder(input: OrderCreateInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // 1. Validar dados
  const validated = orderCreateSchema.parse(input);

  // 2. Obter cotação atualizada para cálculo final (segurança)
  const rate = await getExchangeRate();

  // 3. Calcular custos
  const productBrl = Number((validated.priceJpy * rate).toFixed(2));
  const serviceFee = Number((productBrl * SERVICE_FEE_PERCENT).toFixed(2));
  const totalBrl = Number(((productBrl + serviceFee) * validated.quantity + FIXED_FEE_BRL).toFixed(2));

  // 4. Criar pedido no banco
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productUrl: validated.productUrl,
      productName: validated.productName,
      productImage: validated.productImage,
      priceJpy: validated.priceJpy,
      priceBrl: productBrl,
      serviceFee: serviceFee,
      fixedFee: FIXED_FEE_BRL,
      totalBrl: totalBrl,
      quantity: validated.quantity,
      variation: validated.variation,
      notes: validated.notes,
      status: 'AWAITING_PURCHASE', // Começa aguardando compra (pós-pagamento simulado ou Pix gerado)
    },
  });

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: user.id }
  });

  if (!order) {
    throw new Error('Pedido não encontrado');
  }

  // RN10: Apenas cancela se estiver AWAITING_PURCHASE
  if (order.status !== 'AWAITING_PURCHASE') {
    throw new Error('Este pedido não pode mais ser cancelado');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Atualizar status do pedido
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });

    // 2. Reembolsar na carteira
    const wallet = await tx.wallet.findUnique({
      where: { userId: user.id }
    });

    if (wallet) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: order.totalBrl } }
      });

      // 3. Criar transação de estorno
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          amount: order.totalBrl,
          description: `Estorno do pedido ${order.productName.substring(0, 30)}...`,
          referenceId: order.id
        }
      });
    }
  });

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard/wallet');
}
