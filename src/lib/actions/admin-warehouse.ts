'use server';

import prisma from '@/lib/prisma/client';
import { OrderStatus, WarehouseItemStatus, ExtraServiceStatus, TransactionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { warehouseReceiveSchema, type WarehouseReceiveInput } from '@/lib/validators/warehouse-receive.schema';
import { qualityCheckResultSchema, type QualityCheckResultInput } from '@/lib/validators/quality-check-result.schema';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendEmail } from '@/lib/email/service';
import { extendDeadlineSchema, type ExtendDeadlineInput } from '@/lib/validators/extend-deadline.schema';
import { manualChargeSchema, type ManualChargeInput } from '@/lib/validators/manual-charge.schema';
import { contactClientSchema, type ContactClientInput } from '@/lib/validators/contact-client.schema';
import ItemArrivedEmail from '@/lib/email/templates/ItemArrivedEmail';
import React from 'react';

export async function getOrdersInTransit(search?: string) {
  return await prisma.order.findMany({
    where: {
      status: OrderStatus.IN_TRANSIT_TO_WAREHOUSE,
      OR: search ? [
        { productName: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
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
      warehouseItem: {
        include: {
          extraServices: {
            where: { type: 'QUALITY_CHECK' },
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });
}

export async function confirmWarehouseReceipt(
  orderId: string,
  receiveData: WarehouseReceiveInput,
  qualityCheckData?: QualityCheckResultInput
) {
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

  // Validar inputs
  const validatedReceive = warehouseReceiveSchema.parse(receiveData);
  let validatedQC = null;
  if (qualityCheckData) {
    validatedQC = qualityCheckResultSchema.parse(qualityCheckData);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      warehouseItem: {
        include: {
          extraServices: {
            where: { type: 'QUALITY_CHECK', status: 'REQUESTED' }
          }
        }
      }
    }
  });

  if (!order || order.status !== OrderStatus.IN_TRANSIT_TO_WAREHOUSE) {
    throw new Error('Pedido não encontrado ou não está em trânsito para o armazém');
  }

  // Verificar se QC foi solicitado mas não fornecido
  const qcRequested = order.warehouseItem?.extraServices.length ?? 0 > 0;
  if (qcRequested && !qualityCheckData) {
    throw new Error('Resultado do Quality Check é obrigatório para este item');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Atualizar Pedido
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.IN_WAREHOUSE },
    });

    // 2. Criar ou Atualizar WarehouseItem
    // Nota: O WarehouseItem pode ter sido criado na solicitação de serviço extra
    const arrivedAt = new Date();
    const freeStorageDeadline = addDays(arrivedAt, 60); // RN07: 60 dias de armazenamento grátis

    let warehouseItem;
    if (order.warehouseItem) {
      warehouseItem = await tx.warehouseItem.update({
        where: { id: order.warehouseItem.id },
        data: {
          name: order.productName,
          photos: validatedReceive.photos,
          weightGrams: validatedReceive.weightGrams,
          lengthCm: validatedReceive.lengthCm,
          widthCm: validatedReceive.widthCm,
          heightCm: validatedReceive.heightCm,
          arrivedAt,
          freeStorageDeadline,
          status: WarehouseItemStatus.AVAILABLE,
        },
      });
    } else {
      warehouseItem = await tx.warehouseItem.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          name: order.productName,
          photos: validatedReceive.photos,
          weightGrams: validatedReceive.weightGrams,
          lengthCm: validatedReceive.lengthCm,
          widthCm: validatedReceive.widthCm,
          heightCm: validatedReceive.heightCm,
          arrivedAt,
          freeStorageDeadline,
          status: WarehouseItemStatus.AVAILABLE,
        },
      });
    }

    // 3. Atualizar Quality Check se existir
    if (qualityCheckData && order.warehouseItem?.extraServices[0]) {
      await tx.extraService.update({
        where: { id: order.warehouseItem.extraServices[0].id },
        data: {
          status: ExtraServiceStatus.COMPLETED,
          resultNotes: validatedQC?.notes,
          resultPhotos: validatedQC?.photo ? [validatedQC.photo] : [],
        },
      });
    }

    // 4. Log de Auditoria
    await logAdminAction(
      authUser.id,
      'CONFIRM_RECEIPT',
      'ORDER',
      orderId,
      {
        warehouseItemId: warehouseItem.id,
        weightGrams: validatedReceive.weightGrams,
        dimensions: `${validatedReceive.lengthCm}x${validatedReceive.widthCm}x${validatedReceive.heightCm}`,
        qcResult: validatedQC?.result,
      }
    );

    return warehouseItem;
  });

  // Enviar notificação ao cliente (email)
  try {
    await sendEmail({
      to: order.user.email,
      subject: `Seu item chegou! [${order.productName.slice(0, 30)}...]`,
      react: React.createElement(ItemArrivedEmail, {
        customerName: order.user.fullName,
        productName: order.productName,
        weightGrams: validatedReceive.weightGrams,
        deadline: format(addDays(new Date(), 60), "dd/MM/yyyy", { locale: ptBR }),
      }),
    });
  } catch (error) {
    console.error('Falha ao enviar e-mail de notificação:', error);
    // Não lançamos erro aqui para não cancelar o recebimento se o e-mail falhar
  }

  revalidatePath('/admin/armazem');
  revalidatePath('/dashboard/armazem');
  
  return result;
}

export async function getWarehouseInventory({
  page = 1,
  limit = 10,
  search = '',
  status = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (status) {
    where.status = status as WarehouseItemStatus;
  }

  const [items, total] = await Promise.all([
    prisma.warehouseItem.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { arrivedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.warehouseItem.count({ where }),
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function extendStorageDeadline(itemId: string, data: ExtendDeadlineInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const adminUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!adminUser || adminUser.role !== 'ADMIN') throw new Error('Não autorizado');

  const validated = extendDeadlineSchema.parse(data);

  const item = await prisma.warehouseItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item não encontrado');

  const newDeadline = addDays(item.freeStorageDeadline || new Date(), validated.days);

  const updatedItem = await prisma.warehouseItem.update({
    where: { id: itemId },
    data: { freeStorageDeadline: newDeadline },
  });

  await logAdminAction(adminUser.id, 'EXTEND_DEADLINE', 'WAREHOUSE_ITEM', itemId, {
    days: validated.days,
    reason: validated.reason,
    oldDeadline: item.freeStorageDeadline,
    newDeadline,
  });

  revalidatePath('/admin/armazem');
  return updatedItem;
}

export async function chargeStorageFee(itemId: string, data: ManualChargeInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const adminUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!adminUser || adminUser.role !== 'ADMIN') throw new Error('Não autorizado');

  const validated = manualChargeSchema.parse(data);

  const item = await prisma.warehouseItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item não encontrado');

  let wallet = await prisma.wallet.findUnique({ where: { userId: item.userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: item.userId, balance: 0 } });
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.STORAGE_FEE,
        amount: -validated.amount,
        description: `Cobrança manual: ${validated.reason} (Item: ${item.name})`,
        referenceId: item.id,
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: validated.amount } },
    });

    await logAdminAction(adminUser.id, 'MANUAL_CHARGE', 'WAREHOUSE_ITEM', itemId, {
      amount: validated.amount,
      reason: validated.reason,
      transactionId: transaction.id,
    });

    return transaction;
  });

  revalidatePath('/admin/armazem');
  return result;
}

export async function contactClientAboutItem(itemId: string, data: ContactClientInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const adminUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!adminUser || adminUser.role !== 'ADMIN') throw new Error('Não autorizado');

  const validated = contactClientSchema.parse(data);

  const item = await prisma.warehouseItem.findUnique({
    where: { id: itemId },
    include: { user: true },
  });
  if (!item) throw new Error('Item não encontrado');

  await logAdminAction(adminUser.id, 'CONTACT_CLIENT', 'WAREHOUSE_ITEM', itemId, {
    subject: validated.subject,
    message: validated.message,
  });

  revalidatePath('/admin/armazem');
  return true;
}
