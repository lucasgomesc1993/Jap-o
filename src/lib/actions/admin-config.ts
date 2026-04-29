'use server';

import prisma from '@/lib/prisma/client';
import { adminConfigSchema, legalDocumentSchema } from '@/lib/schemas/admin-config.schema';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/lib/utils/audit-logger';
import { createClient } from '@/lib/supabase/server';

async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (dbUser?.role !== 'ADMIN') throw new Error('Acesso negado');

  return dbUser;
}

export async function getSystemConfig() {
  const config = await prisma.systemConfig.findUnique({
    where: { id: 'CURRENT' }
  });

  if (!config) {
    // Configurações padrão se não existir
    const defaultConfig = {
      id: 'CURRENT',
      serviceFeePercent: 10.00,
      fixedFeeBrl: 30.00,
      freeStorageDays: 60,
      storageFeePerDay: 5.00,
      jpyExchangeRate: 0.0350,
      shippingRates: {
        SAL: [
          { min: 0, max: 500, basePrice: 50, pricePerGram: 0.06 },
          { min: 500, max: 1000, basePrice: 80, pricePerGram: 0.05 },
          { min: 1000, max: 30000, basePrice: 130, pricePerGram: 0.04 }
        ],
        EMS: [
          { min: 0, max: 500, basePrice: 100, pricePerGram: 0.12 },
          { min: 500, max: 1000, basePrice: 160, pricePerGram: 0.08 },
          { min: 1000, max: 30000, basePrice: 240, pricePerGram: 0.07 }
        ],
        DHL: [
          { min: 0, max: 500, basePrice: 150, pricePerGram: 0.2 },
          { min: 500, max: 30000, basePrice: 250, pricePerGram: 0.1 }
        ],
        FEDEX: [
          { min: 0, max: 500, basePrice: 160, pricePerGram: 0.2 },
          { min: 500, max: 30000, basePrice: 260, pricePerGram: 0.1 }
        ]
      },
      extraServicePrices: {
        EXTRA_PHOTO: 10,
        QUALITY_CHECK: 20,
        REMOVE_PACKAGING: 5,
        EXTRA_PROTECTION: 15
      },
      allowedPlatforms: ["https://www.amazon.co.jp", "https://jp.mercari.com", "https://www.rakuten.co.jp"],
      prohibitedProducts: ["Baterias", "Líquidos Inflamáveis", "Armas", "Drogas"]
    };

    return await prisma.systemConfig.create({
      data: defaultConfig
    });
  }

  return config;
}

export async function updateSystemConfig(data: any) {
  const admin = await getAdminUser();
  const validatedData = adminConfigSchema.parse(data);

  const oldConfig = await prisma.systemConfig.findUnique({ where: { id: 'CURRENT' } });

  const updatedConfig = await prisma.systemConfig.update({
    where: { id: 'CURRENT' },
    data: {
      ...validatedData,
      serviceFeePercent: validatedData.serviceFeePercent,
      fixedFeeBrl: validatedData.fixedFeeBrl,
      jpyExchangeRate: validatedData.jpyExchangeRate,
      storageFeePerDay: validatedData.storageFeePerDay,
      shippingRates: validatedData.shippingRates as any,
      extraServicePrices: validatedData.extraServicePrices as any,
      allowedPlatforms: validatedData.allowedPlatforms as any,
      prohibitedProducts: validatedData.prohibitedProducts as any,
    }
  });

  await logAdminAction(
    admin.id,
    'UPDATE_CONFIG',
    'SYSTEM_CONFIG',
    'CURRENT',
    {
      before: oldConfig,
      after: updatedConfig
    }
  );

  revalidatePath('/admin/config');
  return updatedConfig;
}

export async function getLegalDocument(type: string = 'TERMS_OF_RESPONSIBILITY') {
  return await prisma.legalDocument.findFirst({
    where: { type },
    orderBy: { version: 'desc' }
  });
}

export async function updateLegalDocument(content: string, type: string = 'TERMS_OF_RESPONSIBILITY') {
  const admin = await getAdminUser();
  legalDocumentSchema.parse({ content });

  const lastDoc = await getLegalDocument(type);
  const nextVersion = lastDoc ? lastDoc.version + 1 : 1;

  const newDoc = await prisma.legalDocument.create({
    data: {
      type,
      content,
      version: nextVersion
    }
  });

  await logAdminAction(
    admin.id,
    'UPDATE_LEGAL_DOC',
    'LEGAL_DOCUMENT',
    newDoc.id,
    {
      type,
      version: nextVersion
    }
  );

  revalidatePath('/admin/config');
  return newDoc;
}

export async function getAuditLogs(page: number = 1, limit: number = 20) {
  await getAdminUser(); // Apenas para checar se é admin
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        admin: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLog.count()
  ]);

  return {
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalEntries: total
  };
}
