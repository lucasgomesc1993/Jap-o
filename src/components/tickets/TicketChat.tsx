'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Ticket, TicketMessage } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketMessageSchema, TicketMessageInput } from '@/lib/validators/ticket-message.schema';
import { replyTicket } from '@/lib/actions/tickets';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { toast } from '@/stores/toast.store';
import styles from './TicketChat.module.css';

interface TicketChatProps {
  ticket: Ticket & { messages: TicketMessage[] };
  isAdmin?: boolean;
  onReply?: (data: TicketMessageInput) => Promise<any>;
}

export function TicketChat({ ticket, isAdmin = false, onReply }: TicketChatProps) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketMessageInput>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: {
      ticketId: ticket.id,
      content: '',
      attachments: [],
    }
  });

  const onSubmit = async (data: TicketMessageInput) => {
    setLoading(true);
    try {
      if (onReply) {
        await onReply(data);
      } else {
        await replyTicket(data);
      }
      reset();
      toast.success('Mensagem enviada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {ticket.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.messageWrapper} ${msg.authorRole === 'ADMIN' ? styles.admin : styles.customer}`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.author}>
                {msg.authorRole === 'ADMIN' ? 'NipponBox Suporte' : isAdmin ? 'Cliente' : 'Você'}
              </span>
              <span className={styles.date}>
                {new Date(msg.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className={styles.messageContent}>
              <p>{msg.content}</p>
              
              {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                <div className={styles.attachments}>
                  {msg.attachments.map((url: any, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                      <Image 
                        src={url} 
                        alt="Anexo" 
                        width={100}
                        height={100}
                        className={styles.attachmentImg} 
                        style={{ objectFit: 'cover' }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isResolved ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.replyForm}>
          <textarea 
            {...register('content')} 
            className={styles.textarea}
            placeholder="Digite sua resposta..."
            rows={3}
          />
          {errors.content && <span className={styles.error}>{errors.content.message}</span>}
          
          <div className={styles.actions}>
            <Button type="submit" loading={loading} disabled={loading}>
              Responder
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.resolvedNote}>
          <Badge variant="success">Este chamado foi resolvido e está fechado para novas mensagens.</Badge>
        </div>
      )}
    </div>
  );
}
