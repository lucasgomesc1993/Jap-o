import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { TicketForm } from '@/components/tickets/TicketForm';
import styles from '../page.module.css';

export default async function NewTicketPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: { id: true, productName: true },
    orderBy: { createdAt: 'desc' },
  });

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.id },
    select: { id: true, trackingCode: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Novo Chamado</h1>
        <p className={styles.subtitle}>Descreva seu problema e nossa equipe irá ajudar.</p>
      </header>

      <TicketForm orders={orders} shipments={shipments} />
    </div>
  );
}
