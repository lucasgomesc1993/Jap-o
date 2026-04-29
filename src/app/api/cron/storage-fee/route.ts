import { NextRequest, NextResponse } from 'next/server';
import { processDailyStorageFees } from '@/lib/actions/admin-storage-fees';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Cron Job para processar as taxas de armazenamento diariamente.
 * Deve ser configurado no vercel.json ou chamado por um serviço de agendamento externo.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Proteção simples via secret, se configurado no ambiente
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    console.log('Iniciando processamento de taxas de armazenamento via Cron...');
    const result = await processDailyStorageFees();
    console.log('Processamento concluído:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro crítico no cron de taxas de armazenamento:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno desconhecido'
    }, { status: 500 });
  }
}
