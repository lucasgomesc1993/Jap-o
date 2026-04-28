import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/utils/exchange-rate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Proteção contra chamadas não autorizadas (opcional, mas recomendado)
  // No Vercel Cron, ele envia um cabeçalho de autorização se configurado
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    console.log('Iniciando atualização de cotação via Cron...');
    const rate = await getExchangeRate();
    console.log(`Cotação atualizada com sucesso: ${rate}`);

    return NextResponse.json({
      success: true,
      rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no cron de cotação:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
