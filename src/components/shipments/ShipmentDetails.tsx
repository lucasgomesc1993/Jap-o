'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ShipmentDetails.module.css';
import ShipmentTimeline from './ShipmentTimeline';
import { ShipmentStatus, DeclaredValueType } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { confirmShipmentDelivery } from '@/lib/actions/shipment-details';
import { useRouter } from 'next/navigation';

interface ShipmentDetailsProps {
  shipment: any; // Tipagem simplificada para o exemplo
}

export default function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  };

  const handleConfirmDelivery = async () => {
    if (!confirm('Você confirma que recebeu este pacote em mãos?')) return;

    setLoading(true);
    const result = await confirmShipmentDelivery(shipment.id);
    setLoading(false);

    if (result.success) {
      alert('Entrega confirmada com sucesso!');
      router.refresh();
    } else {
      alert(result.error || 'Erro ao confirmar entrega');
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/dashboard/envios" className={styles.backLink}>
        ← Voltar para Meus Envios
      </Link>

      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Envio #{shipment.id.slice(0, 8).toUpperCase()}</h1>
          <div className={styles.metaInfo}>
            <span>Criado em {format(new Date(shipment.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            <span>•</span>
            <span>{shipment.shipmentItems.length} itens</span>
          </div>
        </div>

        {shipment.trackingCode ? (
          <div className={styles.trackingCode}>
            <span className={styles.trackingLabel}>Código de Rastreio</span>
            <span className={styles.trackingValue}>
              <a 
                href={`https://t.17track.net/pt#nums=${shipment.trackingCode}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {shipment.trackingCode}
              </a>
            </span>
          </div>
        ) : (
          <div className={styles.trackingCode}>
            <span className={styles.trackingLabel}>Status do Rastreio</span>
            <span className={styles.trackingValue} style={{ color: 'var(--color-on-surface-variant)' }}>
              Aguardando Postagem
            </span>
          </div>
        )}
      </header>

      <div className={styles.card}>
        <ShipmentTimeline currentStatus={shipment.status} />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Itens no Pacote</h2>
            <div className={styles.itemList}>
              {shipment.shipmentItems.map((item: any) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.warehouseItem.photos[0] ? (
                      <img 
                        src={item.warehouseItem.photos[0]} 
                        alt={item.warehouseItem.name} 
                        className={styles.itemImage}
                      />
                    ) : (
                      <div className={styles.itemImage} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.warehouseItem.name}</span>
                    <span className={styles.itemMeta}>
                      Peso: {item.warehouseItem.weightGrams}g | 
                      Ref: {item.warehouseItem.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Resumo do Envio</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Método</span>
              <span className={styles.infoValue}>{shipment.shippingMethod}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Peso Total</span>
              <span className={styles.infoValue}>{shipment.totalWeightGrams}g</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Custo do Frete</span>
              <span className={styles.infoValue}>{formatCurrency(shipment.shippingCostBrl)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Seguro ({shipment.hasInsurance ? 'Ativo' : 'Não'})</span>
              <span className={styles.infoValue}>{formatCurrency(shipment.insuranceCostBrl)}</span>
            </div>
            <div className={styles.infoRow} style={{ marginTop: '16px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
              <span className={styles.infoLabel} style={{ fontWeight: '600', color: 'var(--color-on-background)' }}>Total Pago</span>
              <span className={styles.infoValue} style={{ fontWeight: '700', fontSize: '18px', color: 'var(--color-primary)' }}>
                {formatCurrency(Number(shipment.shippingCostBrl) + Number(shipment.insuranceCostBrl))}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Declaração Aduaneira</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Tipo</span>
              <span className={styles.infoValue}>
                {shipment.declaredValueType === 'REAL' ? 'Valor Real' : 'Valor Manual'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Valor Declarado</span>
              <span className={styles.infoValue}>{formatCurrency(shipment.declaredValueBrl)}</span>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Endereço de Entrega</h2>
            <div className={styles.addressBox}>
              <strong>{shipment.address.label}</strong><br />
              {shipment.address.street}, {shipment.address.number}<br />
              {shipment.address.complement && <>{shipment.address.complement}<br /></>}
              {shipment.address.neighborhood}<br />
              {shipment.address.city} - {shipment.address.state}<br />
              CEP: {shipment.address.cep}
            </div>
          </div>

          {shipment.status === 'OUT_FOR_DELIVERY' && (
            <div className={styles.confirmSection}>
              <p>Já recebeu seu pacote?</p>
              <button 
                className={styles.btnConfirm} 
                onClick={handleConfirmDelivery}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Entrega'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
