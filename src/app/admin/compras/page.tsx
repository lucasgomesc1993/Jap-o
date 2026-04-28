import { PurchaseQueue } from '@/components/admin/PurchaseQueue';
import styles from '../page.module.css';

export const metadata = {
  title: 'Fila de Compras | NipponBox Admin',
};

export default function AdminOrdersPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fila de Compras</h1>
        <p className={styles.subtitle}>
          Gerencie os pedidos aguardando compra e controle o trânsito para o armazém.
        </p>
      </header>

      <div className={styles.content}>
        <PurchaseQueue />
      </div>
    </div>
  );
}
