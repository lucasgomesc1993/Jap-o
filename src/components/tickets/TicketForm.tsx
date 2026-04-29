'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketCreateSchema, TicketCreateInput } from '@/lib/validators/ticket-create.schema';
import { createTicket } from '@/lib/actions/tickets';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { createClient } from '@/lib/supabase/browser';
import { toast } from '@/stores/toast.store';
import styles from './TicketForm.module.css';

interface TicketFormProps {
  orders: { id: string, productName: string }[];
  shipments: { id: string, trackingCode: string | null, createdAt: Date }[];
}

export function TicketForm({ orders, shipments }: TicketFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      attachments: [],
    }
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (files.length + selectedFiles.length > 5) {
        toast.error('No máximo 5 fotos permitidas');
        return;
      }

      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          toast.error(`Arquivo ${file.name} não é uma imagem válida`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} é muito grande (máx 5MB)`);
          return;
        }
      }

      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TicketCreateInput) => {
    setLoading(true);
    try {
      let attachmentUrls: string[] = [];

      if (files.length > 0) {
        setUploading(true);
        const supabase = createClient();
        
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `tickets/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('ticket-attachments')
            .getPublicUrl(filePath);

          attachmentUrls.push(publicUrl);
        }
        setUploading(false);
      }

      await createTicket({
        ...data,
        attachments: attachmentUrls,
      });

      toast.success('Chamado aberto com sucesso!');
      router.push('/dashboard/tickets');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao abrir chamado');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Tipo de Chamado</label>
          <select {...register('type')} className={styles.select}>
            <option value="">Selecione...</option>
            <option value="ITEM_ISSUE">Problema com Item</option>
            <option value="TRACKING">Rastreamento</option>
            <option value="BILLING">Financeiro</option>
            <option value="OTHER">Outros</option>
          </select>
          {errors.type && <span className={styles.error}>{errors.type.message}</span>}
        </div>

        <div className={styles.field}>
          <label>Assunto</label>
          <Input 
            {...register('subject')} 
            placeholder="Ex: Minha compra ainda não chegou"
            errorMessage={errors.subject?.message}
          />
        </div>

        <div className={styles.field}>
          <label>Pedido Vinculado (Opcional)</label>
          <select {...register('orderId')} className={styles.select}>
            <option value="">Nenhum</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>{order.productName}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Envio Vinculado (Opcional)</label>
          <select {...register('shipmentId')} className={styles.select}>
            <option value="">Nenhum</option>
            {shipments.map(shipment => (
              <option key={shipment.id} value={shipment.id}>
                {shipment.trackingCode || `Envio de ${new Date(shipment.createdAt).toLocaleDateString('pt-BR')}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Mensagem</label>
        <textarea 
          {...register('content')} 
          className={styles.textarea}
          placeholder="Descreva seu problema em detalhes..."
          rows={5}
        />
        {errors.content && <span className={styles.error}>{errors.content.message}</span>}
      </div>

      <div className={styles.field}>
        <label>Anexos (Máx 5 imagens)</label>
        <div className={styles.uploadArea}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={onFileChange}
            id="file-upload"
            className={styles.fileInput}
            disabled={files.length >= 5}
          />
          <label htmlFor="file-upload" className={styles.uploadBtn}>
            Selecionar Imagens
          </label>
          
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span className={styles.fileName}>{file.name}</span>
                <button type="button" onClick={() => removeFile(index)} className={styles.removeBtn}>&times;</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading || uploading}>
          {uploading ? 'Enviando fotos...' : 'Abrir Chamado'}
        </Button>
      </div>
    </form>
  );
}
