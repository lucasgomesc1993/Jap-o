'use server';

import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { ticketCreateSchema, TicketCreateInput } from '@/lib/validators/ticket-create.schema';
import { ticketMessageSchema, TicketMessageInput } from '@/lib/validators/ticket-message.schema';
import { revalidatePath } from 'next/cache';

export async function createTicket(input: TicketCreateInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const validated = ticketCreateSchema.parse(input);

  // Se houver orderId ou shipmentId, validar se pertence ao usuário
  if (validated.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId, userId: user.id },
    });
    if (!order) throw new Error('Pedido não encontrado ou não pertence a você');
  }

  if (validated.shipmentId) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: validated.shipmentId, userId: user.id },
    });
    if (!shipment) throw new Error('Envio não encontrado ou não pertence a você');
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      subject: validated.subject,
      type: validated.type,
      orderId: validated.orderId || null,
      shipmentId: validated.shipmentId || null,
      status: 'OPEN',
      messages: {
        create: {
          authorId: user.id,
          authorRole: 'CUSTOMER',
          content: validated.content,
          attachments: validated.attachments,
        },
      },
    },
  });

  revalidatePath('/dashboard/tickets');
  return ticket;
}

export async function getTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  return prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getTicketDetails(ticketId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket || ticket.userId !== user.id) {
    throw new Error('Chamado não encontrado');
  }

  return ticket;
}

export async function replyTicket(input: TicketMessageInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const validated = ticketMessageSchema.parse(input);

  const ticket = await prisma.ticket.findUnique({
    where: { id: validated.ticketId },
  });

  if (!ticket || ticket.userId !== user.id) {
    throw new Error('Chamado não encontrado');
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: validated.ticketId,
      authorId: user.id,
      authorRole: 'CUSTOMER',
      content: validated.content,
      attachments: validated.attachments,
    },
  });

  await prisma.ticket.update({
    where: { id: validated.ticketId },
    data: { updatedAt: new Date(), status: 'OPEN' }, // Reabre ou mantém aberto se o cliente responde
  });

  revalidatePath(`/dashboard/tickets/${validated.ticketId}`);
  return message;
}
