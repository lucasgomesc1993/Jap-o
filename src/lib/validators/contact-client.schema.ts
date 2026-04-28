import { z } from 'zod';

export const contactClientSchema = z.object({
  subject: z.string().min(3, 'O assunto deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
});

export type ContactClientInput = z.infer<typeof contactClientSchema>;
