'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { ShipmentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getShipments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const shipments = await prisma.shipment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        shipmentItems: {
          include: {
            warehouseItem: true,
          },
        },
      },
    });

    return shipments;
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    throw new Error('Não foi possível carregar os envios');
  }
}

export async function getShipmentDetail(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { 
        id,
        userId: user.id, // Segurança: apenas o dono vê
      },
      include: {
        address: true,
        shipmentItems: {
          include: {
            warehouseItem: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new Error('Envio não encontrado');
    }

    return shipment;
  } catch (error: any) {
    console.error('Erro ao buscar detalhes do envio:', error);
    throw new Error(error.message || 'Não foi possível carregar os detalhes do envio');
  }
}

export async function confirmShipmentDelivery(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado' };
  }

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id, userId: user.id },
    });

    if (!shipment) {
      return { error: 'Envio não encontrado' };
    }

    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      return { error: 'O envio só pode ser confirmado quando estiver em rota de entrega' };
    }

    await prisma.shipment.update({
      where: { id },
      data: { status: ShipmentStatus.DELIVERED },
    });

    revalidatePath(`/dashboard/envios/${id}`);
    revalidatePath('/dashboard/envios');

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao confirmar entrega:', error);
    return { error: 'Erro ao confirmar entrega' };
  }
}
