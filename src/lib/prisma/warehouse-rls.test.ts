import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from './client';
import { WarehouseItemStatus } from '@prisma/client';

describe('Warehouse RLS Logic', () => {
  let userAId: string;
  let userBId: string;
  let itemAId: string;

  beforeAll(async () => {
    // Create User A
    const userA = await prisma.user.create({
      data: {
        email: `rls-a-${Date.now()}@test.com`,
        fullName: 'User A',
        cpf: `cpf-a-${Date.now()}`,
      }
    });
    userAId = userA.id;

    // Create User B
    const userB = await prisma.user.create({
      data: {
        email: `rls-b-${Date.now()}@test.com`,
        fullName: 'User B',
        cpf: `cpf-b-${Date.now()}`,
      }
    });
    userBId = userB.id;

    // Create Item for User A
    const itemA = await prisma.warehouseItem.create({
      data: {
        userId: userAId,
        name: 'Item do Usuario A',
        status: WarehouseItemStatus.AVAILABLE,
      }
    });
    itemAId = itemA.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
  });

  it('Lógica da Policy: Usuário B não deve ver itens do Usuário A', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "${userBId}", "role": "authenticated"}', true)`);
      
      const items = await tx.$queryRawUnsafe(`
        SELECT * FROM warehouse_items 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return items;
    });

    expect(result.filter(i => i.id === itemAId)).toHaveLength(0);
  });

  it('Lógica da Policy: Usuário A deve ver seus próprios itens', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "${userAId}", "role": "authenticated"}', true)`);
      
      const items = await tx.$queryRawUnsafe(`
        SELECT * FROM warehouse_items 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return items;
    });

    expect(result.some(i => i.id === itemAId)).toBe(true);
  });

  it('Lógica da Policy: Admin deve ver itens de todos os usuários', async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000", "role": "ADMIN"}', true)`);
      
      const items = await tx.$queryRawUnsafe(`
        SELECT * FROM warehouse_items 
        WHERE (auth.uid()::text = "userId" OR (auth.jwt() ->> 'role') = 'ADMIN')
      `) as any[];
      return items;
    });

    expect(result.some(i => i.id === itemAId)).toBe(true);
  });
});
