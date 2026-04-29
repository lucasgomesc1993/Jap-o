import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminTickets, getAdminTicketDetails, replyTicketAdmin, updateTicketStatus } from './admin-tickets';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { sendEmail } from '@/lib/email/service';

vi.mock('@/lib/prisma/client', () => ({
  default: {
    ticket: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ticketMessage: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/utils/audit-logger', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('@/lib/email/service', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Admin Tickets Actions', () => {
  const mockAdminUser = { id: 'admin-id', role: 'ADMIN' };
  const mockTicket = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-id',
    subject: 'Test Subject',
    status: 'OPEN',
    user: { email: 'user@example.com', fullName: 'User Name' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } }),
      },
    });
    (prisma.user.findUnique as any).mockResolvedValue(mockAdminUser);
  });

  describe('getAdminTickets', () => {
    it('should return tickets with pagination', async () => {
      (prisma.ticket.findMany as any).mockResolvedValue([mockTicket]);
      (prisma.ticket.count as any).mockResolvedValue(1);

      const result = await getAdminTickets({ page: 1, limit: 10 });

      expect(result.tickets).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
      }));
    });

    it('should filter by status and type', async () => {
      (prisma.ticket.findMany as any).mockResolvedValue([]);
      (prisma.ticket.count as any).mockResolvedValue(0);

      await getAdminTickets({ status: 'RESOLVED', type: 'BILLING' });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'RESOLVED',
          type: 'BILLING',
        }),
      }));
    });
  });

  describe('replyTicketAdmin', () => {
    it('should create a message and update ticket status', async () => {
      (prisma.ticket.findUnique as any).mockResolvedValue(mockTicket);
      (prisma.ticketMessage.create as any).mockResolvedValue({ id: 'msg-id' });

      await replyTicketAdmin({
        ticketId: '11111111-1111-1111-1111-111111111111',
        content: 'Admin response',
      });

      expect(prisma.ticketMessage.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          authorRole: 'ADMIN',
          content: 'Admin response',
        }),
      }));
      expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'IN_REVIEW' }),
      }));
      expect(logAdminAction).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('updateTicketStatus', () => {
    it('should update status and log action', async () => {
      (prisma.ticket.findUnique as any).mockResolvedValue(mockTicket);

      await updateTicketStatus('11111111-1111-1111-1111-111111111111', 'RESOLVED');

      expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '11111111-1111-1111-1111-111111111111' },
        data: expect.objectContaining({ status: 'RESOLVED' }),
      }));
      expect(logAdminAction).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled(); // Email for RESOLVED
    });
  });
});
