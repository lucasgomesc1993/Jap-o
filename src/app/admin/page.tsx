import { Card } from '@/components/ui';
import styles from './page.module.css';
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Admin | NipponBox',
};

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Pedidos Pendentes', value: '0', icon: <ShoppingCart size={24} />, color: '#BC002D' },
    { label: 'Novos Clientes (Mês)', value: '0', icon: <Users size={24} />, color: '#0F172A' },
    { label: 'Itens no Armazém', value: '0', icon: <Package size={24} />, color: '#0284C7' },
    { label: 'Receita Prevista', value: 'R$ 0,00', icon: <TrendingUp size={24} />, color: '#059669' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel Administrativo</h1>
        <p className={styles.subtitle}>Gestão de pedidos, logística e usuários.</p>
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
      
      <div className={styles.grid2Col}>
        <Card className={styles.sectionCard}>
          <h3 className={styles.cardTitle}>Últimos Pedidos</h3>
          <div className={styles.emptyState}>Carregando dados...</div>
        </Card>
        <Card className={styles.sectionCard}>
          <h3 className={styles.cardTitle}>Aguardando Processamento</h3>
          <div className={styles.emptyState}>Nenhum item pendente.</div>
        </Card>
      </div>
    </div>
  );
}
