import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      try {
        // Sincronizar status de confirmação no Prisma
        await prisma.user.update({
          where: { id: data.user.id },
          data: { emailConfirmed: true },
        });
      } catch (err) {
        console.error('Failed to sync email confirmation to Prisma:', err);
        // Mesmo se o Prisma falhar, o usuário está logado no Auth, 
        // então deixamos prosseguir, o middleware ou dashboard pode tratar depois.
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Erro na troca do código
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
