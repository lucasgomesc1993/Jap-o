'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ShipmentList.module.css';
import { ShipmentStatus } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShipmentItem {
  id: string;
  warehouseItem: {
    id: string;
    name: string;
  };
}

interface Shipment {
  id: string;
  shippingMethod: string;
  status: ShipmentStatus;
  createdAt: Date;
  shippingCostBrl: any; // Decimal
  insuranceCostBrl: any; // Decimal
  totalWeightGrams: number;
  trackingCode: string | null;
  shipmentItems: ShipmentItem[];
}

interface ShipmentListProps {
  initialShipments: Shipment[];
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PREPARING: 'Preparando',
  SHIPPED: 'Postado',
  IN_TRANSIT: 'Em Trânsito',
  IN_BRAZIL: 'No Brasil',
  OUT_FOR_DELIVERY: 'Saiu para Entrega',
  DELIVERED: 'Entregue',
};

export default function ShipmentList({ initialShipments }: ShipmentListProps) {
  const [filter, setFilter] = useState<ShipmentStatus | 'ALL'>('ALL');

  const filteredShipments = filter === 'ALL' 
    ? initialShipments 
    : initialShipments.filter(s => s.status === filter);

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Meus Envios</h1>
          <p>Acompanhe o status e o rastreio dos seus pacotes vindos do Japão.</p>
        </div>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Todos
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'PREPARING' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('PREPARING')}
          >
            Preparando
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'SHIPPED' || filter === 'IN_TRANSIT' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('SHIPPED')}
          >
            Em Trânsito
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'DELIVERED' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('DELIVERED')}
          >
            Entregue
          </button>
        </div>
      </header>

      {filteredShipments.length === 0 ? (
        <div className={styles.empty}>
          <h2>Nenhum envio encontrado</h2>
          <p>Você ainda não criou nenhum envio ou não há itens com o status selecionado.</p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/dashboard/armazem" className="btn-primary">
              Ir para o Armazém
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredShipments.map((shipment) => (
            <Link 
              key={shipment.id} 
              href={`/dashboard/envios/${shipment.id}`}
              className={styles.shipmentCard}
            >
              <div className={styles.mainInfo}>
                <div className={styles.idGroup}>
                  <span className={styles.shipmentId}>#{shipment.id.slice(0, 8).toUpperCase()}</span>
                  <span className={styles.date}>
                    {format(new Date(shipment.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className={styles.methodGroup}>
                  <span className={styles.methodLabel}>Método</span>
                  <span className={styles.methodValue}>{shipment.shippingMethod}</span>
                </div>

                <div className={styles.statusGroup}>
                  <span className={`${styles.badge} ${styles['badge' + shipment.status]}`}>
                    {STATUS_LABELS[shipment.status]}
                  </span>
                </div>
              </div>

              <div className={styles.detailsGroup}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Itens</span>
                  <span className={styles.detailValue}>{shipment.shipmentItems.length}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Peso</span>
                  <span className={styles.detailValue}>{shipment.totalWeightGrams}g</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total</span>
                  <span className={styles.detailValue}>
                    {formatCurrency(Number(shipment.shippingCostBrl) + Number(shipment.insuranceCostBrl))}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
