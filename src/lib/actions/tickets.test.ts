import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTicket, getTickets, getTicketDetails, replyTicket } from './tickets';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock do Prisma
vi.mock('@/lib/prisma/client', () => ({
  default: {
    ticket: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ticketMessage: {
      create: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
    },
    shipment: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock do revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Ticket Actions', () => {
  const mockUser = { id: 'user-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
  });

  describe('createTicket', () => {
    it('deve criar um ticket com sucesso', async () => {
      const input = {
        type: 'ITEM_ISSUE' as const,
        subject: 'Teste Assunto',
        content: 'Teste Conteúdo que deve ter pelo menos 10 caracteres',
      };

      (prisma.ticket.create as any).mockResolvedValue({ id: 'ticket-1', ...input });

      const result = await createTicket(input);

      expect(result.id).toBe('ticket-1');
      expect(prisma.ticket.create).toHaveBeenCalled();
    });

    it('deve falhar se orderId não pertencer ao usuário', async () => {
      const input = {
        type: 'ITEM_ISSUE' as const,
        subject: 'Teste Assunto',
        content: 'Teste Conteúdo que deve ter pelo menos 10 caracteres',
        orderId: '550e8400-e29b-41d4-a716-446655440000',
      };

      (prisma.order.findUnique as any).mockResolvedValue(null);

      await expect(createTicket(input)).rejects.toThrow('Pedido não encontrado ou não pertence a você');
    });
  });

  describe('getTickets', () => {
    it('deve retornar lista de tickets do usuário', async () => {
      const mockTickets = [{ id: '550e8400-e29b-41d4-a716-446655440001' }, { id: '550e8400-e29b-41d4-a716-446655440002' }];
      (prisma.ticket.findMany as any).mockResolvedValue(mockTickets);

      const result = await getTickets();

      expect(result).toHaveLength(2);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: mockUser.id }
      }));
    });
  });

  describe('getTicketDetails', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440001';
    it('deve retornar detalhes do ticket', async () => {
      const mockTicket = { id: validId, userId: 'user-1', messages: [] };
      (prisma.ticket.findUnique as any).mockResolvedValue(mockTicket);

      const result = await getTicketDetails(validId);

      expect(result.id).toBe(validId);
    });

    it('deve falhar se o ticket não for do usuário', async () => {
      const mockTicket = { id: validId, userId: 'other-user' };
      (prisma.ticket.findUnique as any).mockResolvedValue(mockTicket);

      await expect(getTicketDetails(validId)).rejects.toThrow('Chamado não encontrado');
    });
  });

  describe('replyTicket', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440001';
    it('deve adicionar mensagem ao ticket', async () => {
      const mockTicket = { id: validId, userId: 'user-1' };
      (prisma.ticket.findUnique as any).mockResolvedValue(mockTicket);
      (prisma.ticketMessage.create as any).mockResolvedValue({ id: 'm1' });

      const result = await replyTicket({
        ticketId: validId,
        content: 'Minha resposta',
      });

      expect(result.id).toBe('m1');
      expect(prisma.ticketMessage.create).toHaveBeenCalled();
      expect(prisma.ticket.update).toHaveBeenCalled();
    });
  });
});
