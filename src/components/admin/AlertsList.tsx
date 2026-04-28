'use client';

import { Card, Skeleton } from '@/components/ui';
import { AlertTriangle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './AlertsList.module.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertsListProps {
  alerts?: {
    storageExpiring: any[];
    pendingPayments: any[];
  };
  isLoading?: boolean;
}

export function AlertsList({ alerts, isLoading }: AlertsListProps) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        <Card className={styles.section}>
          <Skeleton className={styles.skeletonTitle} />
          <div className={styles.list}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className={styles.skeletonItem} />
            ))}
          </div>
        </Card>
        <Card className={styles.section}>
          <Skeleton className={styles.skeletonTitle} />
          <div className={styles.list}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className={styles.skeletonItem} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const hasAlerts = (alerts?.storageExpiring.length ?? 0) > 0 || (alerts?.pendingPayments.length ?? 0) > 0;

  if (!hasAlerts) {
    return (
      <Card className={styles.emptyState}>
        <div className={styles.emptyIcon}>✅</div>
        <h3>Tudo em dia!</h3>
        <p>Não há alertas críticos no momento.</p>
      </Card>
    );
  }

  return (
    <div className={styles.grid}>
      {alerts?.storageExpiring.length! > 0 && (
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock size={20} className={styles.iconStorage} />
            <h3>Prazos de Armazenamento ({'<'} 7 dias)</h3>
          </div>
          <div className={styles.list}>
            {alerts?.storageExpiring.map((item) => (
              <Link key={item.id} href={`/admin/armazem?id=${item.id}`} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemUser}>{item.user.fullName}</span>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.itemDeadline}>
                    Vence em {format(new Date(item.freeStorageDeadline), 'dd/MM', { locale: ptBR })}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {alerts?.pendingPayments.length! > 0 && (
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <CreditCard size={20} className={styles.iconPayment} />
            <h3>Pagamentos Pendentes</h3>
          </div>
          <div className={styles.list}>
            {alerts?.pendingPayments.map((order) => (
              <Link key={order.id} href={`/admin/compras?id=${order.id}`} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{order.productName}</span>
                  <span className={styles.itemUser}>{order.user.fullName}</span>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.itemPrice}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalBrl)}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
