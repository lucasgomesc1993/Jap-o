import { getTickets } from '@/lib/actions/tickets';
import { TicketList } from '@/components/tickets/TicketList';
import styles from './page.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suporte | NipponBox',
  description: 'Gerencie seus chamados e tire suas dúvidas.',
};

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Suporte</h1>
        <p className={styles.subtitle}>Gerencie seus chamados e tire suas dúvidas.</p>
      </header>

      <TicketList tickets={tickets} />
    </div>
  );
}
