import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import { Package, Warehouse, Send, Wallet } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | NipponBox',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar dados reais
  const [activeOrdersCount, warehouseItemsCount, shipmentsCount, wallet] = await Promise.all([
    prisma.order.count({
      where: { 
        userId: user.id,
        status: { in: ['AWAITING_PURCHASE', 'PURCHASED', 'IN_TRANSIT_TO_WAREHOUSE'] }
      }
    }),
    prisma.warehouseItem.count({
      where: { 
        userId: user.id,
        status: 'AVAILABLE'
      }
    }),
    prisma.shipment.count({
      where: { userId: user.id }
    }),
    prisma.wallet.findUnique({
      where: { userId: user.id }
    })
  ]);

  const balance = wallet ? Number(wallet.balance) : 0;

  const stats = [
    { id: '01', label: 'Pedidos Ativos', value: activeOrdersCount.toString(), icon: <Package size={20} strokeWidth={1.5} /> },
    { id: '02', label: 'No Armazém', value: warehouseItemsCount.toString(), icon: <Warehouse size={20} strokeWidth={1.5} /> },
    { id: '03', label: 'Envios Realizados', value: shipmentsCount.toString(), icon: <Send size={20} strokeWidth={1.5} /> },
    { id: '04', label: 'Saldo em Carteira', value: `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <Wallet size={20} strokeWidth={1.5} /> },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Visão Geral</h1>
        <p className={styles.subtitle}>Acompanhe suas compras, gerencie seu armazém e consolide envios do Japão para o Brasil com precisão absoluta.</p>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>
                <span className={styles.statIndex}>{stat.id}</span>
                <span>// {stat.label}</span>
              </span>
              <div className={styles.statIcon}>
                {stat.icon}
              </div>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
        <div className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <p>Nenhuma atividade registrada no sistema.</p>
            <p className={styles.emptyHint}>Crie um pedido para iniciar o fluxo logístico.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
