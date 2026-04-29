import { z } from 'zod';

export const ticketCreateSchema = z.object({
  type: z.enum(['ITEM_ISSUE', 'TRACKING', 'BILLING', 'OTHER'], {
    required_error: 'Selecione o tipo do chamado',
  }),
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres').max(100, 'Assunto muito longo'),
  content: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  orderId: z.string().uuid().optional().or(z.literal('')),
  shipmentId: z.string().uuid().optional().or(z.literal('')),
  attachments: z.array(z.string()).max(5, 'No máximo 5 fotos permitidas').default([]),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
