'use server';

import prisma from '@/lib/prisma/client';
import { TicketStatus, TicketType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { ticketMessageSchema, type TicketMessageInput } from '@/lib/validators/ticket-message.schema';
import { sendEmail } from '@/lib/email/service';
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function getAdminTickets({
  status,
  type,
  search,
  page = 1,
  limit = 10,
}: {
  status?: TicketStatus;
  type?: TicketType;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getAdminTicketDetails(ticketId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const admin = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!admin || admin.role !== 'ADMIN') throw new Error('Não autorizado');

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) throw new Error('Chamado não encontrado');

  return ticket;
}

export async function replyTicketAdmin(input: TicketMessageInput) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const admin = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!admin || admin.role !== 'ADMIN') throw new Error('Não autorizado');

  const validated = ticketMessageSchema.parse(input);

  const ticket = await prisma.ticket.findUnique({
    where: { id: validated.ticketId },
    include: { user: true },
  });

  if (!ticket) throw new Error('Chamado não encontrado');

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: validated.ticketId,
      authorId: admin.id,
      authorRole: 'ADMIN',
      content: validated.content,
      attachments: validated.attachments,
    },
  });

  await prisma.ticket.update({
    where: { id: validated.ticketId },
    data: { updatedAt: new Date(), status: 'IN_REVIEW' },
  });

  await logAdminAction(admin.id, 'REPLY_TICKET', 'TICKET', ticket.id, {
    messageId: message.id,
  });

  // Notificar cliente por email
  try {
    await sendEmail({
      to: ticket.user.email,
      subject: `Nova resposta no seu chamado: ${ticket.subject}`,
      react: React.createElement('div', {}, [
        React.createElement('h1', { key: 'h1' }, 'Olá, ' + ticket.user.fullName),
        React.createElement('p', { key: 'p1' }, 'Você recebeu uma nova resposta da nossa equipe de suporte no chamado: ' + ticket.subject),
        React.createElement('p', { key: 'p2' }, 'Acesse seu painel para visualizar e responder.'),
        React.createElement('a', { key: 'a', href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/${ticket.id}` }, 'Ver chamado'),
      ]),
    });
  } catch (error) {
    console.error('Falha ao enviar email:', error);
  }

  revalidatePath(`/admin/suporte/${validated.ticketId}`);
  revalidatePath(`/dashboard/tickets/${validated.ticketId}`);
  
  return message;
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Não autenticado');

  const admin = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!admin || admin.role !== 'ADMIN') throw new Error('Não autorizado');

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { user: true },
  });

  if (!ticket) throw new Error('Chamado não encontrado');

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status, updatedAt: new Date() },
  });

  await logAdminAction(admin.id, 'UPDATE_TICKET_STATUS', 'TICKET', ticketId, {
    oldStatus: ticket.status,
    newStatus: status,
  });

  // Notificar cliente por email se resolvido
  if (status === 'RESOLVED') {
    try {
      await sendEmail({
        to: ticket.user.email,
        subject: `Chamado Resolvido: ${ticket.subject}`,
        react: React.createElement('div', {}, [
          React.createElement('h1', { key: 'h1' }, 'Olá, ' + ticket.user.fullName),
          React.createElement('p', { key: 'p' }, 'Seu chamado "' + ticket.subject + '" foi marcado como RESOLVIDO.'),
          React.createElement('p', { key: 'p2' }, 'Caso precise de mais ajuda, você pode abrir um novo chamado.'),
        ]),
      });
    } catch (error) {
      console.error('Falha ao enviar email:', error);
    }
  }

  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath('/admin/suporte');
  revalidatePath(`/dashboard/tickets/${ticketId}`);

  return updatedTicket;
}

export async function getOpenTicketsCount() {
  return prisma.ticket.count({
    where: { status: 'OPEN' },
  });
}
