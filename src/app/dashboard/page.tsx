import { Card } from '@/components/ui';
import styles from './page.module.css';
import { Package, Warehouse, Send, Wallet } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | NipponBox',
};

export default function DashboardPage() {
  const stats = [
    { label: 'Pedidos Ativos', value: '0', icon: <Package size={24} />, color: '#BC002D' },
    { label: 'No Armazém', value: '0', icon: <Warehouse size={24} />, color: '#4B5563' },
    { label: 'Envios Realizados', value: '0', icon: <Send size={24} />, color: '#059669' },
    { label: 'Saldo em Carteira', value: 'R$ 0,00', icon: <Wallet size={24} />, color: '#D97706' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Visão Geral</h1>
        <p className={styles.subtitle}>Acompanhe suas compras e envios do Japão.</p>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <Card key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: stat.color, backgroundColor: `${stat.color}10` }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
        <Card className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <p>Você ainda não possui atividades registradas.</p>
            <p className={styles.emptyHint}>Comece adicionando um novo pedido de compra.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
