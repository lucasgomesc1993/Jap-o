import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSession } from './middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ 
        cookies: { set: vi.fn() },
        headers: new Headers() 
      })),
      redirect: vi.fn((url) => ({ 
        url,
        cookies: { set: vi.fn() },
        headers: new Headers()
      })),
    },
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-key';
  });

  const createMockRequest = (path: string) => {
    return new NextRequest(new URL(path, 'http://localhost:3000'));
  };

  it('deve redirecionar para login se acessar dashboard sem sessão', async () => {
    (createServerClient as any).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    });

    const req = createMockRequest('/dashboard');
    await updateSession(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const calledUrl = (NextResponse.redirect as any).mock.calls[0][0].toString();
    expect(calledUrl).toContain('/login');
  });

  it('deve redirecionar para confirmar-email se email não confirmado', async () => {
    (createServerClient as any).mockReturnValue({
      auth: { 
        getUser: vi.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: '123', 
              app_metadata: { email_confirmed: false } 
            } 
          }, 
          error: null 
        }) 
      },
    });

    const req = createMockRequest('/dashboard');
    await updateSession(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const calledUrl = (NextResponse.redirect as any).mock.calls[0][0].toString();
    expect(calledUrl).toContain('/confirmar-email');
  });

  it('deve bloquear admin se usuário for customer', async () => {
    (createServerClient as any).mockReturnValue({
      auth: { 
        getUser: vi.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: '123', 
              role: 'authenticated',
              app_metadata: { email_confirmed: true, role: 'CUSTOMER' } 
            } 
          }, 
          error: null 
        }) 
      },
    });

    const req = createMockRequest('/admin');
    await updateSession(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const calledUrl = (NextResponse.redirect as any).mock.calls[0][0].toString();
    expect(calledUrl).toContain('/dashboard');
  });
});
