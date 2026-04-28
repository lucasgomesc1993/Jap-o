import prisma from '@/lib/prisma/client';
import { headers } from 'next/headers';

export async function logAdminAction(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any = {}
) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;

  return await prisma.auditLog.create({
    data: {
      adminUserId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    },
  });
}
