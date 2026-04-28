import { NextRequest, NextResponse } from 'next/server';
import { mpPayment } from '@/lib/mercadopago/client';
import prisma from '@/lib/prisma/client';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic') || searchParams.get('type');
  const id = searchParams.get('id') || searchParams.get('data.id');

  // 1. Validar assinatura
  const signature = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id');
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (secret && signature && requestId) {
    try {
      const parts = signature.split(',');
      const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
      const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

      if (ts && v1 && id) {
        const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
        
        if (hmac !== v1) {
          return new NextResponse('Assinatura inválida', { status: 401 });
        }
      }
    } catch (err) {
      console.error('Erro na validação HMAC:', err);
    }
  }

  if (topic === 'payment' && id) {
    try {
      const payment = await mpPayment.get({ id });

      if (payment.status === 'approved') {
        const reference = payment.external_reference;
        const amount = payment.transaction_amount;

        // Verificar idempotência (se já processamos este paymentId)
        const existingTransaction = await prisma.transaction.findFirst({
          where: { referenceId: String(id) }
        });

        if (existingTransaction) {
          return new NextResponse('Pagamento já processado', { status: 200 });
        }

        if (reference?.startsWith('ORDER_')) {
          const orderId = reference.replace('ORDER_', '');
          
          await prisma.$transaction(async (tx) => {
            // Atualizar Pedido
            await tx.order.update({
              where: { id: orderId },
              data: { status: 'AWAITING_PURCHASE' }
            });

            // Opcional: Criar transação de registro (embora tenha sido Pix direto)
            // No PRD, Pix direto também pode gerar uma transação no extrato para histórico
          });

        } else if (reference?.startsWith('WALLET_')) {
          const userId = reference.replace('WALLET_', '');
          
          await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
              where: { userId }
            });

            if (wallet) {
              // Atualizar Saldo
              await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
              });

              // Criar Transação
              await tx.transaction.create({
                data: {
                  walletId: wallet.id,
                  type: 'CREDIT',
                  amount: amount!,
                  description: 'Recarga de carteira via Pix',
                  referenceId: String(id)
                }
              });
            }
          });
        }
      }

      return new NextResponse('OK', { status: 200 });
    } catch (error) {
      console.error('Erro ao processar webhook MP:', error);
      return new NextResponse('Erro interno', { status: 500 });
    }
  }

  return new NextResponse('Ignorado', { status: 200 });
}
