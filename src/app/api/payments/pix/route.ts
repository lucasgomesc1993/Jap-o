import { NextRequest, NextResponse } from 'next/server';
import { mpPayment } from '@/lib/mercadopago/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { amount, description, referenceId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 422 });
    }

    const paymentResponse = await mpPayment.create({
      body: {
        transaction_amount: amount,
        description: description || 'Pagamento NipponBox',
        payment_method_id: 'pix',
        payer: {
          email: user.email!,
        },
        external_reference: referenceId,
        // Notificações virão para o webhook configurado no dashboard do MP
        // ou via notification_url aqui se desejar sobrescrever
      }
    });

    const pointOfInteraction = paymentResponse.point_of_interaction;
    
    return NextResponse.json({
      paymentId: paymentResponse.id,
      qrCode: pointOfInteraction?.transaction_data?.qr_code,
      qrCodeBase64: pointOfInteraction?.transaction_data?.qr_code_base64,
      status: paymentResponse.status,
    });

  } catch (error) {
    console.error('Erro ao gerar Pix:', error);
    return NextResponse.json({ 
      error: 'Falha ao processar pagamento via Pix' 
    }, { status: 500 });
  }
}
