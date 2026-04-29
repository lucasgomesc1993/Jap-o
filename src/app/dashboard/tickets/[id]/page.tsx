import { getTicketDetails } from '@/lib/actions/tickets';
import { TicketChat } from '@/components/tickets/TicketChat';
import { Badge } from '@/components/ui/Badge/Badge';
import Link from 'next/link';
import styles from './ticket-detail.module.css';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const ticket = await getTicketDetails(id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="warning">Aberto</Badge>;
      case 'IN_REVIEW': return <Badge variant="info">Em Análise</Badge>;
      case 'RESOLVED': return <Badge variant="success">Resolvido</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboard/tickets" className={styles.backLink}>
            &larr; Voltar para lista
          </Link>
          {getStatusBadge(ticket.status)}
        </div>
        <h1 className={styles.title}>{ticket.subject}</h1>
        <div className={styles.meta}>
          <span>ID: {ticket.id}</span>
          <span>Iniciado em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </header>

      <TicketChat ticket={ticket} />
    </div>
  );
}
