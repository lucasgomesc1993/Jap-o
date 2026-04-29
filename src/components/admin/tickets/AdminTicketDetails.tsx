'use client';

import React, { useState } from 'react';
import { Ticket, TicketMessage, User } from '@prisma/client';
import styles from './AdminTicketDetails.module.css';
import { TicketChat } from '@/components/tickets/TicketChat';
import { Button, Badge } from '@/components/ui';
import { updateTicketStatus, replyTicketAdmin } from '@/lib/actions/admin-tickets';
import { toast } from '@/stores/toast.store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketMessageSchema, TicketMessageInput } from '@/lib/validators/ticket-message.schema';

interface AdminTicketDetailsProps {
  ticket: Ticket & { 
    messages: TicketMessage[];
    user: User;
  };
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

export function AdminTicketDetails({ ticket }: AdminTicketDetailsProps) {
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: any) => {
    setLoading(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      setCurrentStatus(newStatus);
      toast.success(`Status atualizado para ${TICKET_STATUS[newStatus as keyof typeof TICKET_STATUS]}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  // Reutilizando a lógica do TicketChat mas com a ação do admin
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketMessageInput>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: {
      ticketId: ticket.id,
      content: '',
      attachments: [],
    }
  });

  const onReply = async (data: TicketMessageInput) => {
    setLoading(true);
    try {
      await replyTicketAdmin(data);
      reset();
      toast.success('Resposta enviada!');
      setCurrentStatus('IN_REVIEW');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar resposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{ticket.subject}</h1>
          <div className={styles.meta}>
            <span className={styles.typeBadge}>
              {TICKET_TYPES[ticket.type as keyof typeof TICKET_TYPES]}
            </span>
            <span className={styles.date}>
              Aberto em {format(new Date(ticket.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {currentStatus !== 'IN_REVIEW' && currentStatus !== 'RESOLVED' && (
            <Button 
              variant="secondary" 
              onClick={() => handleStatusChange('IN_REVIEW')}
              disabled={loading}
            >
              Marcar em Análise
            </Button>
          )}
          {currentStatus !== 'RESOLVED' && (
            <Button 
              variant="primary" 
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={loading}
            >
              Marcar como Resolvido
            </Button>
          )}
          {currentStatus === 'RESOLVED' && (
             <Button 
             variant="secondary" 
             onClick={() => handleStatusChange('OPEN')}
             disabled={loading}
           >
             Reabrir Chamado
           </Button>
          )}
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.chatSection}>
          <TicketChat 
            ticket={{ ...ticket, status: currentStatus }} 
            isAdmin={true}
            onReply={onReply}
          />
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3>Informações do Cliente</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nome:</span>
              <span className={styles.infoValue}>{ticket.user.fullName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{ticket.user.email}</span>
            </div>
          </div>

          {(ticket.orderId || ticket.shipmentId) && (
            <div className={styles.infoCard}>
              <h3>Vínculos</h3>
              {ticket.orderId && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Pedido:</span>
                  <span className={styles.infoValue}>
                    <Link href={`/admin/pedidos/${ticket.orderId}`} style={{ textDecoration: 'underline' }}>
                      {ticket.orderId.slice(0, 8)}
                    </Link>
                  </span>
                </div>
              )}
              {ticket.shipmentId && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Envio:</span>
                  <span className={styles.infoValue}>
                    <Link href={`/admin/envios/${ticket.shipmentId}`} style={{ textDecoration: 'underline' }}>
                      {ticket.shipmentId.slice(0, 8)}
                    </Link>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className={styles.infoCard}>
            <h3>Status Atual</h3>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant={currentStatus === 'RESOLVED' ? 'success' : currentStatus === 'IN_REVIEW' ? 'warning' : 'error'}>
                {TICKET_STATUS[currentStatus as keyof typeof TICKET_STATUS]}
              </Badge>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import Link from 'next/link';
