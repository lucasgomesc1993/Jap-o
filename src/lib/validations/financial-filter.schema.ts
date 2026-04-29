import { z } from 'zod';

export const financialFilterSchema = z.object({
  dateFrom: z.string().optional().transform(v => v ? new Date(v) : undefined),
  dateTo: z.string().optional().transform(v => v ? new Date(v) : undefined),
});

export type FinancialFilter = z.infer<typeof financialFilterSchema>;
