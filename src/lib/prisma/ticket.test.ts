import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from './client';
import { TicketType, TicketStatus, Role } from '@prisma/client';

describe('Ticket Prisma Model & RLS Logic', () => {
  let userAId: string;
  let userBId: string;
  let ticketAId: string;

  beforeAll(async () => {
    // Create User A
    const userA = await prisma.user.create({
      data: {
        email: `ticket-a-${Date.now()}@test.com`,
        fullName: 'User Ticket A',
        cpf: `cpfta-${Date.now()}`,
      }
    });
    userAId = userA.id;

    // Create User B
    const userB = await prisma.user.create({
      data: {
        email: `ticket-b-${Date.now()}@test.com`,
        fullName: 'User Ticket B',
        cpf: `cpftb-${Date.now()}`,
      }
    });
    userBId = userB.id;

    // Create Ticket for User A (Criar ticket com dados válidos e enums corretos)
    const ticketA = await prisma.ticket.create({
      data: {
        userId: userAId,
        type: TicketType.ITEM_ISSUE,
        subject: 'Problema no item',
        status: TicketStatus.OPEN,
        messages: {
          create: {
            authorId: userAId,
            authorRole: Role.CUSTOMER,
            content: 'Meu item veio quebrado.',
          }
        }
      },
      include: {
        messages: true
      }
    });
    ticketAId = ticketA.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
  });

  it('Deve criar ticket com dados válidos e mensagem vinculada, usando enums corretos', async () => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketAId },
      include: { messages: true }
    });

    expect(ticket).toBeDefined();
    expect(ticket?.type).toBe(TicketType.ITEM_ISSUE);
    expect(ticket?.status).toBe(TicketStatus.OPEN);
    expect(ticket?.subject).toBe('Problema no item');
    expect(ticket?.messages).toHaveLength(1);
    expect(ticket?.messages[0].content).toBe('Meu item veio quebrado.');
    expect(ticket?.messages[0].authorRole).toBe(Role.CUSTOMER);
  });

  it('Lógica da Policy: Usuário B não deve ver tickets do Usuário A', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "${userBId}", "role": "authenticated"}', true)`);
      
      const tickets = await tx.$queryRawUnsafe(`
        SELECT * FROM tickets 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return tickets;
    });

    expect(result.filter(t => t.id === ticketAId)).toHaveLength(0);
  });

  it('Lógica da Policy: Usuário A deve ver seus próprios tickets', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "${userAId}", "role": "authenticated"}', true)`);
      
      const tickets = await tx.$queryRawUnsafe(`
        SELECT * FROM tickets 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return tickets;
    });

    expect(result.some(t => t.id === ticketAId)).toBe(true);
  });

  it('Lógica da Policy: Admin deve ver tickets de todos os usuários', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000", "role": "ADMIN"}', true)`);
      
      const tickets = await tx.$queryRawUnsafe(`
        SELECT * FROM tickets 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return tickets;
    });

    expect(result.some(t => t.id === ticketAId)).toBe(true);
  });
});
