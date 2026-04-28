import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { NextResponse } from 'next/server';

// Mocks
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/prisma/client', () => ({
  default: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ 
      url, 
      status: 302,
      // Mocking headers as an object for compatibility
      headers: new Headers() 
    })),
  },
}));

describe('Auth Callback Route', () => {
  const origin = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve trocar o código por sessão e redirecionar para o dashboard', async () => {
    const mockUser = { id: 'user-123' };
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ 
          data: { user: mockUser }, 
          error: null 
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = new Request(`${origin}/auth/callback?code=valid-code`);
    await GET(request);

    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('valid-code');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { emailConfirmed: true },
    });
    expect(NextResponse.redirect).toHaveBeenCalledWith(`${origin}/dashboard`);
  });

  it('deve redirecionar para o login em caso de erro no código', async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ 
          data: { user: null }, 
          error: { message: 'Invalid code' } 
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = new Request(`${origin}/auth/callback?code=invalid-code`);
    await GET(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(`${origin}/login?error=auth_code_error`);
  });

  it('deve redirecionar para o login se não houver código', async () => {
    const request = new Request(`${origin}/auth/callback`);
    await GET(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(`${origin}/login?error=auth_code_error`);
  });

  it('deve redirecionar para um parâmetro "next" customizado se fornecido', async () => {
    const mockUser = { id: 'user-123' };
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ 
          data: { user: mockUser }, 
          error: null 
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = new Request(`${origin}/auth/callback?code=valid-code&next=/orders/new`);
    await GET(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(`${origin}/orders/new`);
  });
});
