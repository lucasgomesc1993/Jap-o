'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { toast } from '@/stores/toast.store';
import { createClient } from '@/lib/supabase/browser';
import { markOrderAsPurchased } from '@/lib/actions/admin-orders';

interface MarkPurchasedModalProps {
  orderId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkPurchasedModal({
  orderId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: MarkPurchasedModalProps) {
  const [loading, setLoading] = useState(false);
  const [realPriceJpy, setRealPriceJpy] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('O comprovante é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Upload receipt
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(uploadData.path);

      // 2. Call server action
      await markOrderAsPurchased(orderId, {
        realPriceJpy: parseFloat(realPriceJpy),
        arrivalExpectedAt: new Date(arrivalDate),
        receiptUrl: publicUrl,
      });

      toast.success('Pedido marcado como comprado!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Compra"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
          Registrando a compra de: <strong>{productName}</strong>
        </p>

        <Input
          label="Valor Real Pago (¥)"
          type="number"
          step="0.01"
          required
          value={realPriceJpy}
          onChange={(e) => setRealPriceJpy(e.target.value)}
          placeholder="Ex: 1500"
        />

        <Input
          label="Previsão de Chegada no Armazém"
          type="date"
          required
          value={arrivalDate}
          onChange={(e) => setArrivalDate(e.target.value)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Comprovante de Compra</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{
              padding: '8px',
              border: '1px solid var(--color-outline)',
              borderRadius: 'var(--rounded)',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <Button variant="ghost" onClick={onClose} type="button" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Confirmar Compra
          </Button>
        </div>
      </form>
    </Modal>
  );
}
