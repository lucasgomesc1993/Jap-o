import { describe, it, expect } from 'vitest';
import { auditLogSchema } from './audit-log.schema';

describe('auditLogSchema', () => {
  it('deve validar um input correto', () => {
    const data = {
      action: 'UPDATE_STATUS',
      entityType: 'ORDER',
      entityId: '12345',
    };
    const result = auditLogSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve falhar se campos estiverem vazios', () => {
    const data = {
      action: '',
      entityType: '',
      entityId: '',
    };
    const result = auditLogSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(3);
    }
  });
});
