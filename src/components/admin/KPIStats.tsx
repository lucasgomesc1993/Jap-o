'use client';

import { Card, Skeleton } from '@/components/ui';
import { ShoppingCart, Package, Send, MessageSquare, TrendingUp } from 'lucide-react';
import styles from './KPIStats.module.css';

interface KPIStatsProps {
  stats?: {
    pendingPurchases: number;
    warehouseItems: number;
    preparingShipments: number;
    openTickets: number;
    monthlyRevenue: number;
  };
  isLoading?: boolean;
}

export function KPIStats({ stats, isLoading }: KPIStatsProps) {
  const kpis = [
    {
      label: 'Pedidos p/ Compra',
      value: stats?.pendingPurchases ?? 0,
      icon: <ShoppingCart size={24} />,
      color: '#BC002D',
    },
    {
      label: 'Itens no Armazém',
      value: stats?.warehouseItems ?? 0,
      icon: <Package size={24} />,
      color: '#0F172A',
    },
    {
      label: 'Prontos p/ Despacho',
      value: stats?.preparingShipments ?? 0,
      icon: <Send size={24} />,
      color: '#0284C7',
    },
    {
      label: 'Chamados Abertos',
      value: stats?.openTickets ?? 0,
      icon: <MessageSquare size={24} />,
      color: '#EA580C',
    },
    {
      label: 'Receita do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.monthlyRevenue ?? 0),
      icon: <TrendingUp size={24} />,
      color: '#059669',
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className={styles.card}>
            <Skeleton className={styles.skeletonIcon} />
            <div className={styles.info}>
              <Skeleton className={styles.skeletonLabel} />
              <Skeleton className={styles.skeletonValue} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {kpis.map((kpi, i) => (
        <Card key={i} className={styles.card}>
          <div className={styles.icon} style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}>
            {kpi.icon}
          </div>
          <div className={styles.info}>
            <span className={styles.label}>{kpi.label}</span>
            <span className={styles.value}>{kpi.value}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
