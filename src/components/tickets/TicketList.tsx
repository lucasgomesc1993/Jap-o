'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ticket } from '@prisma/client';
import { Badge } from '@/components/ui/Badge/Badge';
import { Card } from '@/components/ui/Card/Card';
import styles from './TicketList.module.css';

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'ALL') return true;
    return ticket.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="warning">Aberto</Badge>;
      case 'IN_REVIEW': return <Badge variant="info">Em Análise</Badge>;
      case 'RESOLVED': return <Badge variant="success">Resolvido</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ITEM_ISSUE': return 'Problema com Item';
      case 'TRACKING': return 'Rastreamento';
      case 'BILLING': return 'Financeiro';
      case 'OTHER': return 'Outros';
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Todos
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'OPEN' ? styles.active : ''}`}
            onClick={() => setFilter('OPEN')}
          >
            Abertos
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'IN_REVIEW' ? styles.active : ''}`}
            onClick={() => setFilter('IN_REVIEW')}
          >
            Em Análise
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'RESOLVED' ? styles.active : ''}`}
            onClick={() => setFilter('RESOLVED')}
          >
            Resolvidos
          </button>
        </div>

        <Link href="/dashboard/tickets/new" className={styles.newBtn}>
          Novo Chamado
        </Link>
      </div>

      <div className={styles.list}>
        {filteredTickets.length === 0 ? (
          <p className={styles.empty}>Nenhum chamado encontrado.</p>
        ) : (
          filteredTickets.map(ticket => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className={styles.ticketLink}>
              <Card className={styles.ticketCard}>
                <div className={styles.ticketInfo}>
                  <div className={styles.ticketMain}>
                    <span className={styles.ticketType}>{getTypeLabel(ticket.type)}</span>
                    <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
                  </div>
                  <div className={styles.ticketMeta}>
                    {getStatusBadge(ticket.status)}
                    <span className={styles.ticketDate}>
                      {new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
