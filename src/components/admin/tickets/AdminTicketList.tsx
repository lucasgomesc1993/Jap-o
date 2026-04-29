'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminTicketList.module.css';
import { TicketStatus, TicketType } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAdminTickets } from '@/lib/actions/admin-tickets';
import { Input, Button } from '@/components/ui';

interface AdminTicketListProps {
  initialTickets: any[];
  initialTotal: number;
  initialPages: number;
}

const TICKET_TYPES = {
  ITEM_ISSUE: 'Problema com Item',
  TRACKING: 'Rastreamento',
  BILLING: 'Financeiro',
  OTHER: 'Outro',
};

const TICKET_STATUS = {
  OPEN: 'Aberto',
  IN_REVIEW: 'Em Análise',
  RESOLVED: 'Resolvido',
};

export function AdminTicketList({ initialTickets, initialTotal, initialPages }: AdminTicketListProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [type, setType] = useState<TicketType | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadTickets(page = 1) {
    setLoading(true);
    try {
      const result = await getAdminTickets({
        page,
        status: status || undefined,
        type: type || undefined,
        search: search || undefined,
      });
      setTickets(result.tickets);
      setTotal(result.total);
      setPages(result.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [status, type, search]);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <Input
          placeholder="Buscar por assunto, nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="brutalist-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus)}
          style={{ height: '48px', padding: '0 1rem', border: '2px solid #000', fontWeight: 'bold' }}
        >
          <option value="">Todos os Status</option>
          {Object.entries(TICKET_STATUS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="brutalist-input"
          value={type}
          onChange={(e) => setType(e.target.value as TicketType)}
          style={{ height: '48px', padding: '0 1rem', border: '2px solid #000', fontWeight: 'bold' }}
        >
          <option value="">Todos os Tipos</option>
          {Object.entries(TICKET_TYPES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => loadTickets(1)} disabled={loading}>
          Filtrar
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Assunto</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
              <th>Vínculo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum chamado encontrado.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{ticket.user.fullName}</span>
                      <span className={styles.customerEmail}>{ticket.user.email}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{ticket.subject}</td>
                  <td>
                    <span className={styles.typeBadge}>
                      {TICKET_TYPES[ticket.type as keyof typeof TICKET_TYPES]}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${ticket.status}`]}`}>
                      {TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS]}
                    </span>
                  </td>
                  <td>
                    {format(new Date(ticket.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td>
                    {ticket.orderId && <div style={{ fontSize: '0.7rem' }}>Pedido: {ticket.orderId.slice(0, 8)}</div>}
                    {ticket.shipmentId && <div style={{ fontSize: '0.7rem' }}>Envio: {ticket.shipmentId.slice(0, 8)}</div>}
                    {!ticket.orderId && !ticket.shipmentId && '-'}
                  </td>
                  <td>
                    <Link href={`/admin/suporte/${ticket.id}`} className={styles.link}>
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1 || loading}
            onClick={() => loadTickets(currentPage - 1)}
          >
            Anterior
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => loadTickets(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={currentPage === pages || loading}
            onClick={() => loadTickets(currentPage + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
