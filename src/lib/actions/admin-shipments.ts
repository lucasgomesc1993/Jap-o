'use server';

import prisma from '@/lib/prisma/client';
import { ShipmentStatus, WarehouseItemStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { markShippedSchema, type MarkShippedInput } from '@/lib/validators/mark-shipped.schema';
import { sendEmail } from '@/lib/email/service';

export async function getPendingShipments(search?: string) {
  return await prisma.shipment.findMany({
    where: {
      status: ShipmentStatus.PREPARING,
      OR: search ? [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { trackingCode: { contains: search, mode: 'insensitive' } },
      ] : undefined,
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      address: true,
      shipmentItems: {
        include: {
          warehouseItem: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function markAsShipped(shipmentId: string, data: MarkShippedInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Não autenticado');
  }

  const admin = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Não autorizado');
  }

  const validated = markShippedSchema.parse(data);

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { user: true }
  });

  if (!shipment || shipment.status !== ShipmentStatus.PREPARING) {
    throw new Error('Envio não encontrado ou não está em preparação');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Atualizar Shipment
    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        status: ShipmentStatus.SHIPPED,
        trackingCode: validated.trackingCode,
        totalWeightGrams: validated.finalWeightGrams,
      },
    });

    // 2. Atualizar status dos itens do armazém para SHIPPED
    const shipmentItems = await tx.shipmentItem.findMany({
      where: { shipmentId },
      select: { warehouseItemId: true }
    });

    const itemIds = shipmentItems.map(item => item.warehouseItemId);

    await tx.warehouseItem.updateMany({
      where: { id: { in: itemIds } },
      data: { status: WarehouseItemStatus.SHIPPED }
    });

    // 3. Log de Auditoria
    await logAdminAction(
      authUser.id,
      'MARK_AS_SHIPPED',
      'SHIPMENT',
      shipmentId,
      {
        trackingCode: validated.trackingCode,
        finalWeightGrams: validated.finalWeightGrams,
      }
    );

    return updatedShipment;
  });

  // 4. Enviar e-mail
  try {
    await sendEmail({
      to: shipment.user.email,
      subject: `Seu pacote foi enviado! [${validated.trackingCode}]`,
      html: `<p>Olá ${shipment.user.fullName}, seu pacote foi enviado! Rastreio: ${validated.trackingCode}</p>`,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }

  revalidatePath('/admin/envios');
  revalidatePath('/dashboard/envios');

  return result;
}

export async function updateShipmentStatus(shipmentId: string, newStatus: ShipmentStatus) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Não autenticado');
  }

  const admin = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Não autorizado');
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { user: true }
  });

  if (!shipment) {
    throw new Error('Envio não encontrado');
  }

  // Validação de transição
  const statusOrder: ShipmentStatus[] = [
    ShipmentStatus.PREPARING,
    ShipmentStatus.SHIPPED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.IN_BRAZIL,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.DELIVERED
  ];

  const currentIndex = statusOrder.indexOf(shipment.status);
  const newIndex = statusOrder.indexOf(newStatus);

  if (newIndex <= currentIndex) {
    throw new Error('Novo status deve ser posterior ao atual');
  }

  if (newIndex !== currentIndex + 1) {
    throw new Error('Não é permitido pular estados');
  }

  const result = await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status: newStatus }
  });

  await logAdminAction(
    authUser.id,
    'UPDATE_SHIPMENT_STATUS',
    'SHIPMENT',
    shipmentId,
    { oldStatus: shipment.status, newStatus }
  );

  // Enviar e-mail de atualização
  try {
    await sendEmail({
      to: shipment.user.email,
      subject: `Atualização no seu envio: ${newStatus}`,
      html: `<p>Olá ${shipment.user.fullName}, o status do seu envio ${shipment.trackingCode || shipment.id} mudou para: ${newStatus}</p>`,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }

  revalidatePath('/admin/envios');
  revalidatePath('/dashboard/envios');

  return result;
}
