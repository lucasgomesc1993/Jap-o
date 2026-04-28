import { z } from 'zod';

export const auditLogSchema = z.object({
  action: z.string({
    required_error: 'A ação é obrigatória',
  }).min(1, 'A ação não pode estar vazia'),
  entityType: z.string({
    required_error: 'O tipo de entidade é obrigatório',
  }).min(1, 'O tipo de entidade não pode estar vazio'),
  entityId: z.string({
    required_error: 'O ID da entidade é obrigatório',
  }).min(1, 'O ID da entidade não pode estar vazio'),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;
