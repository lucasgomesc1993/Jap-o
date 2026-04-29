import { z } from 'zod';

export const ticketMessageSchema = z.object({
  ticketId: z.string().uuid(),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  attachments: z.array(z.string()).max(5, 'No máximo 5 fotos permitidas').default([]),
});

export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
