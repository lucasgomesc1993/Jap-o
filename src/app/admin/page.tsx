import { AdminDashboard } from '@/components/admin/AdminDashboard';
import styles from './page.module.css';

export const metadata = {
  title: 'Admin | NipponBox',
};

export default function AdminDashboardPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel Administrativo</h1>
        <p className={styles.subtitle}>Gestão de pedidos, logística e usuários.</p>
      </header>

      <AdminDashboard />
    </div>
  );
}
