import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletDashboard } from './WalletDashboard';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/setup';

// Mocks
vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useToast: () => ({
      addToast: vi.fn(),
    }),
  };
});

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const mockTransactions = [
  {
    id: 'tx1',
    type: 'CREDIT',
    amount: 100,
    description: 'Recarga Pix',
    createdAt: '2026-04-28T10:00:00Z',
  }
];

describe('WalletDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar saldo e transações corretamente', () => {
    render(<WalletDashboard balance={50} transactions={mockTransactions} userId="user1" />);
    expect(screen.getByText('R$ 50,00')).toBeDefined();
    expect(screen.getByText('Recarga Pix')).toBeDefined();
  });

  it('deve abrir o modal de recarga e gerar Pix', async () => {
    server.use(
      http.post('/api/payments/pix', () => {
        return HttpResponse.json({
          qrCode: 'mock-pix-code',
          qrCodeBase64: 'mock-base64',
        });
      })
    );

    render(<WalletDashboard balance={50} transactions={mockTransactions} userId="user1" />);
    
    fireEvent.click(screen.getByText('Adicionar Créditos'));
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '20' } });
    fireEvent.click(screen.getByText('Gerar Pix'));
    
    await waitFor(() => {
      expect(screen.getByText('mock-pix-code')).toBeDefined();
    });
  });

  it('deve copiar o código Pix para o clipboard', async () => {
    server.use(
      http.post('/api/payments/pix', () => {
        return HttpResponse.json({
          qrCode: 'copy-me',
          qrCodeBase64: 'base64',
        });
      })
    );

    render(<WalletDashboard balance={50} transactions={mockTransactions} userId="user1" />);
    
    fireEvent.click(screen.getByText('Adicionar Créditos'));
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '20' } });
    fireEvent.click(screen.getByText('Gerar Pix'));
    
    await waitFor(() => screen.getByText('copy-me'));
    
    const copyBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy-me');
  });
});
