import React from 'react';
import { getOrdersInTransit } from '@/lib/actions/admin-warehouse';
import { WarehouseReceiveList } from '@/components/admin/WarehouseReceive/WarehouseReceiveList';
import styles from './page.module.css';

interface AdminWarehousePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminWarehousePage({ searchParams }: AdminWarehousePageProps) {
  const { q } = await searchParams;
  const orders = await getOrdersInTransit(q);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Controle de Armazém</h1>
          <p className={styles.subtitle}>Gerencie a chegada e o estoque de produtos no Japão.</p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recebimento de Mercadorias</h2>
          <span className={styles.badge}>{orders.length} pedidos em trânsito</span>
        </div>
        
        <WarehouseReceiveList initialOrders={orders} />
      </section>
    </div>
  );
}
