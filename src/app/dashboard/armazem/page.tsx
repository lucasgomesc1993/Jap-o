import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { WarehouseClient } from '@/components/warehouse/WarehouseClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Meu Armazém | NipponBox',
  description: 'Gerencie seus itens armazenados no Japão.',
};

export default async function WarehousePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const items = await prisma.warehouseItem.findMany({
    where: { userId: user.id },
    include: {
      extraServices: true,
    },
    orderBy: { arrivedAt: 'desc' }
  });

  return (
    <main className="container-page">
      <header className="page-header">
        <h1 className="page-title">Meu Armazém</h1>
        <p className="page-subtitle">
          Aqui estão os itens que já chegaram ao nosso centro logístico no Japão.
        </p>
      </header>

      <WarehouseClient items={items} />
    </main>
  );
}
