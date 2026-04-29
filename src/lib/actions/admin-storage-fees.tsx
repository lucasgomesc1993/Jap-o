import prisma from '@/lib/prisma/client';
import { sendEmail } from '@/lib/email/service';
import StorageFeeEmail from '@/lib/email/templates/StorageFeeEmail';
import { Decimal } from '@prisma/client/runtime/library';
import React from 'react';

/**
 * Processa as cobranças diárias de armazenamento para itens que excederam o prazo gratuito.
 * Esta função é projetada para ser chamada por um Cron Job diariamente.
 */
export async function processDailyStorageFees() {
  // 1. Buscar configurações do sistema
  const config = await prisma.systemConfig.findUnique({
    where: { id: 'CURRENT' }
  });

  if (!config) {
    console.error('Configuração do sistema não encontrada (ID: CURRENT)');
    return { success: false, error: 'Configuração do sistema não encontrada' };
  }

  const storageFeePerDay = new Decimal(config.storageFeePerDay.toString());
  const now = new Date();
  // Início do dia atual (00:00:00) para controle de idempotência
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 2. Buscar itens vencidos e disponíveis que não foram cobrados hoje
  // Regras:
  // - Status deve ser AVAILABLE
  // - Prazo gratuito deve ter vencido (freeStorageDeadline < agora)
  // - lastStorageFeeAt deve ser nulo OU anterior ao início do dia de hoje
  const itemsToCharge = await prisma.warehouseItem.findMany({
    where: {
      status: 'AVAILABLE',
      freeStorageDeadline: {
        lt: now
      },
      OR: [
        { lastStorageFeeAt: null },
        { lastStorageFeeAt: { lt: todayStart } }
      ]
    },
    include: {
      user: {
        include: {
          wallet: true
        }
      }
    }
  });

  console.log(`Encontrados ${itemsToCharge.length} itens para cobrança de armazenamento.`);

  const processed = [];

  for (const item of itemsToCharge) {
    try {
      const user = item.user;
      if (!user.wallet) {
        console.warn(`Item ${item.id} não possui carteira vinculada ao usuário.`);
        continue;
      }

      // Calcular quantos dias de atraso total para o e-mail
      const diffTime = Math.abs(now.getTime() - item.freeStorageDeadline!.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Executar a cobrança em uma transação
      await prisma.$transaction(async (tx) => {
        // Criar transação financeira
        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: 'STORAGE_FEE',
            amount: storageFeePerDay,
            description: `Taxa de armazenamento diária - Item: ${item.name}`,
            referenceId: item.id
          }
        });

        // Atualizar saldo da carteira
        // De acordo com a Task 5.7, se saldo insuficiente registramos débito pendente.
        // Permitir saldo negativo é a forma mais direta de registrar essa pendência.
        await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: {
            balance: {
              decrement: storageFeePerDay
            }
          }
        });

        // Atualizar a data da última cobrança para garantir idempotência
        await tx.warehouseItem.update({
          where: { id: item.id },
          data: {
            lastStorageFeeAt: now
          }
        });
      });

      // Enviar e-mail de notificação (assíncrono, não bloqueia o loop principal)
      // Usamos um try/catch interno para que falhas no e-mail não revertam a cobrança no DB
      try {
        await sendEmail({
          to: user.email,
          subject: `Cobrança de Armazenamento: ${item.name}`,
          react: (
            <StorageFeeEmail
              userName={user.fullName}
              itemName={item.name}
              feeAmount={`R$ ${storageFeePerDay.toFixed(2)}`}
              daysExceeded={diffDays}
            />
          )
        });
      } catch (emailError) {
        console.error(`Erro ao enviar e-mail para ${user.email}:`, emailError);
      }

      processed.push({ itemId: item.id, success: true });
    } catch (error) {
      console.error(`Erro ao processar item ${item.id}:`, error);
      processed.push({ itemId: item.id, success: false, error });
    }
  }

  return {
    success: true,
    processedCount: processed.filter(p => p.success).length,
    failedCount: processed.filter(p => !p.success).length,
    timestamp: now.toISOString()
  };
}
