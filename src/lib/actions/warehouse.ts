'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { extraServiceSchema } from '@/lib/validators/extra-service.schema';
import { ExtraServiceType, TransactionType, ShippingMethod, DeclaredValueType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { shipmentCreateSchema, type ShipmentCreateInput } from '@/lib/validators/shipment.schema';
import { calculateShippingCost, calculateInsuranceCost } from '@/lib/utils/shipping-calculator';
import { headers } from 'next/headers';

const SERVICE_PRICES: Record<ExtraServiceType, number> = {
  EXTRA_PHOTO: 5,
  QUALITY_CHECK: 10,
  REMOVE_PACKAGING: 5,
  EXTRA_PROTECTION: 8,
};

const SERVICE_LABELS: Record<ExtraServiceType, string> = {
  EXTRA_PHOTO: 'Fotos Extras',
  QUALITY_CHECK: 'Verificação de Qualidade',
  REMOVE_PACKAGING: 'Remoção de Embalagem',
  EXTRA_PROTECTION: 'Proteção Extra',
};

export async function requestExtraService(formData: { warehouseItemId: string; type: ExtraServiceType }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado' };
  }

  // 1. Validar input
  const validated = extraServiceSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { warehouseItemId, type } = validated.data;
  const price = SERVICE_PRICES[type];

  try {
    return await prisma.$transaction(async (tx) => {
      // 2. Verificar se o item existe e pertence ao usuário
      const item = await tx.warehouseItem.findUnique({
        where: { id: warehouseItemId },
      });

      if (!item) {
        throw new Error('Item não encontrado');
      }

      if (item.userId !== user.id) {
        throw new Error('Você não tem permissão para solicitar serviços para este item');
      }

      // 3. Verificar se o serviço já foi solicitado
      const existingService = await tx.extraService.findFirst({
        where: {
          warehouseItemId,
          type,
        },
      });

      if (existingService) {
        throw new Error(`O serviço ${SERVICE_LABELS[type]} já foi solicitado para este item`);
      }

      // 4. Verificar saldo da carteira
      const wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet || wallet.balance.toNumber() < price) {
        throw new Error('Saldo insuficiente na carteira');
      }

      // 5. Criar ExtraService
      const service = await tx.extraService.create({
        data: {
          warehouseItemId,
          type,
          price,
          status: 'REQUESTED',
        },
      });

      // 6. Debitar carteira
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          balance: {
            decrement: price,
          },
        },
      });

      // 7. Criar transação
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.EXTRA_SERVICE,
          amount: price * -1,
          description: `Serviço Extra: ${SERVICE_LABELS[type]} (Item: ${item.name})`,
          referenceId: service.id,
        },
      });

      // TODO: Notificar admin (notificação interna)

      return { success: true };
    });
  } catch (error: any) {
    return { error: error.message || 'Erro ao solicitar serviço extra' };
  } finally {
    revalidatePath('/dashboard/armazem');
  }
}

export async function createShipment(input: ShipmentCreateInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado' };
  }

  // 1. Validar input
  const validated = shipmentCreateSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { 
    warehouseItemIds, 
    shippingMethod, 
    addressId, 
    hasInsurance, 
    declaredValueType, 
    manualDeclaredValueBrl,
    disclaimerAccepted
  } = validated.data;

  try {
    const clientIp = (await headers()).get('x-forwarded-for') || '127.0.0.1';

    return await prisma.$transaction(async (tx) => {
      // 2. Buscar itens e validar posse/status
      const items = await tx.warehouseItem.findMany({
        where: {
          id: { in: warehouseItemIds },
          userId: user.id,
        },
        include: {
          order: true,
        },
      });

      if (items.length !== warehouseItemIds.length) {
        throw new Error('Um ou mais itens não foram encontrados ou não pertencem a você');
      }

      const invalidItem = items.find(item => item.status !== 'AVAILABLE');
      if (invalidItem) {
        throw new Error(`O item ${invalidItem.name} não está disponível para envio`);
      }

      // 3. Calcular peso total e valores
      const totalWeightGrams = items.reduce((acc, item) => acc + item.weightGrams, 0);
      const shippingCostBrl = calculateShippingCost(shippingMethod as ShippingMethod, totalWeightGrams);

      let declaredValueBrl = 0;
      if (declaredValueType === 'REAL') {
        declaredValueBrl = items.reduce((acc, item) => acc + (item.order ? Number(item.order.priceBrl) * item.order.quantity : 0), 0);
      } else {
        declaredValueBrl = manualDeclaredValueBrl || 0;
      }

      const insuranceCostBrl = hasInsurance ? calculateInsuranceCost(declaredValueBrl) : 0;
      const totalToPay = shippingCostBrl + insuranceCostBrl;

      // 4. Verificar saldo (assumindo pagamento via carteira para esta task)
      const wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet || wallet.balance.toNumber() < totalToPay) {
        throw new Error('Saldo insuficiente na carteira para pagar o frete e seguro');
      }

      // 5. Criar o Shipment
      const shipment = await tx.shipment.create({
        data: {
          userId: user.id,
          shippingMethod: shippingMethod as ShippingMethod,
          totalWeightGrams,
          shippingCostBrl,
          insuranceCostBrl,
          hasInsurance,
          declaredValueType: declaredValueType as DeclaredValueType,
          declaredValueBrl,
          manualDeclaredValueBrl: declaredValueType === 'MANUAL' ? manualDeclaredValueBrl : null,
          addressId,
          disclaimerAcceptedAt: new Date(),
          disclaimerIp: clientIp,
          disclaimerTextVersion: '1.0',
          status: 'PREPARING',
        },
      });

      // 6. Criar ShipmentItems e atualizar status dos WarehouseItems
      await tx.shipmentItem.createMany({
        data: warehouseItemIds.map(id => ({
          shipmentId: shipment.id,
          warehouseItemId: id,
        })),
      });

      await tx.warehouseItem.updateMany({
        where: { id: { in: warehouseItemIds } },
        data: { status: 'SELECTED_FOR_SHIPMENT' },
      });

      // 7. Debitar carteira
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { decrement: totalToPay },
        },
      });

      // 8. Criar transação
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.SHIPPING_PAYMENT,
          amount: totalToPay * -1,
          description: `Pagamento de Envio (${warehouseItemIds.length} itens)`,
          referenceId: shipment.id,
        },
      });

      return { success: true, shipmentId: shipment.id };
    });
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar envio' };
  } finally {
    revalidatePath('/dashboard/armazem');
  }
}
