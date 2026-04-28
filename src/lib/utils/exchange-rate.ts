import prisma from '@/lib/prisma/client';

const API_URL = 'https://economia.awesomeapi.com.br/json/last/JPY-BRL';

export interface ExchangeRateResponse {
  JPYBRL: {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
  };
}

/**
 * Busca a cotação JPY/BRL atualizada.
 * Primeiro tenta buscar no banco de dados para a data de hoje.
 * Se não encontrar, busca na AwesomeAPI, salva no banco e retorna.
 * Se a API falhar, busca a última cotação disponível no banco.
 */
export async function getExchangeRate(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // 1. Tentar buscar no cache do banco para hoje
    const cachedRate = await prisma.exchangeRate.findUnique({
      where: { date: today }
    });

    if (cachedRate) {
      return Number(cachedRate.jpyToBrl);
    }

    // 2. Buscar na API
    const response = await fetch(API_URL, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar cotação na AwesomeAPI');
    }

    const data: ExchangeRateResponse = await response.json();
    const rate = parseFloat(data.JPYBRL.bid);

    // 3. Salvar no banco
    try {
      await prisma.exchangeRate.upsert({
        where: { date: today },
        update: { jpyToBrl: rate, fetchedAt: new Date() },
        create: { date: today, jpyToBrl: rate, fetchedAt: new Date() }
      });
    } catch (dbError) {
      console.error('Erro ao salvar cotação no banco:', dbError);
      // Ignorar erro de banco e retornar o valor da API
    }

    return rate;
  } catch (error) {
    console.error('Erro ao obter cotação:', error);

    // 4. Fallback: buscar a última cotação disponível no banco
    const lastRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' }
    });

    if (lastRate) {
      return Number(lastRate.jpyToBrl);
    }

    // Se nem o fallback funcionar, retorna um valor padrão seguro ou lança erro
    // Valor aproximado histórico se tudo falhar (não ideal, mas evita crash total)
    return 0.04; 
  }
}

/**
 * Formata um valor em JPY para BRL usando a cotação atual.
 */
export async function convertJpyToBrl(amountJpy: number): Promise<{
  amountBrl: number;
  rate: number;
}> {
  const rate = await getExchangeRate();
  return {
    amountBrl: amountJpy * rate,
    rate
  };
}
