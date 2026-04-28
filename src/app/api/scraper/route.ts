import { NextRequest, NextResponse } from 'next/server';
import { scrapeProduct } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const productData = await scrapeProduct(url);

    return NextResponse.json(productData);
  } catch (error) {
    console.error('Erro no scraping:', error);
    
    const message = error instanceof Error ? error.message : 'Erro ao processar a URL';
    const status = message.includes('Plataforma não suportada') ? 422 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
