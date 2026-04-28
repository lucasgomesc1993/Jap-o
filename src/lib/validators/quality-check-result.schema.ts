import { z } from 'zod';

export const qualityCheckResultSchema = z
  .object({
    result: z.enum(['OK', 'PROBLEM'], {
      errorMap: () => ({ message: 'Resultado deve ser OK ou PROBLEM' }),
    }),
    notes: z.string().optional(),
    photo: z.string().url('URL da foto inválida').optional(),
  })
  .refine(
    (data) => {
      if (data.result === 'PROBLEM' && !data.photo) {
        return false;
      }
      return true;
    },
    {
      message: 'Foto de problema obrigatória se resultado for PROBLEM',
      path: ['photo'],
    }
  );

export type QualityCheckResultInput = z.infer<typeof qualityCheckResultSchema>;
