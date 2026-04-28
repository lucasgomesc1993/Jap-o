'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markShippedSchema, type MarkShippedInput } from '@/lib/validators/mark-shipped.schema';
import { markAsShipped } from '@/lib/actions/admin-shipments';
import { Button, Input, Modal } from '@/components/ui';
import { toast } from '@/stores/toast.store';
import styles from './MarkShippedModal.module.css';

interface MarkShippedModalProps {
  shipmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkShippedModal({ shipmentId, isOpen, onClose, onSuccess }: MarkShippedModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MarkShippedInput>({
    resolver: zodResolver(markShippedSchema),
  });

  const onSubmit = async (data: MarkShippedInput) => {
    setIsSubmitting(true);
    try {
      await markAsShipped(shipmentId, data);
      toast.success('Envio marcado como despachado!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar envio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marcar como Enviado">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.fields}>
          <Input
            label="Código de Rastreio"
            placeholder="Ex: AA123456789JP"
            {...register('trackingCode')}
            errorMessage={errors.trackingCode?.message}
          />
          <Input
            label="Peso Final (g)"
            type="number"
            placeholder="Ex: 1500"
            {...register('finalWeightGrams', { valueAsNumber: true })}
            errorMessage={errors.finalWeightGrams?.message}
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Confirmar Despacho
          </Button>
        </div>
      </form>
    </Modal>
  );
}
