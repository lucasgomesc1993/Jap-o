'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { extraServiceSchema } from '@/lib/validators/extra-service.schema';
import { ExtraServiceType, TransactionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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
