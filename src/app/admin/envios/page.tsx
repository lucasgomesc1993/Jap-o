import { ShipmentList } from '@/components/admin/ShipmentList';
import styles from './page.module.css';

export const metadata = {
  title: 'Expedição | Nipponbox Admin',
};

export default function AdminShipmentsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Expedição</h1>
        <p className={styles.subtitle}>Gerencie o despacho e rastreio de pacotes para o Brasil.</p>
      </header>

      <ShipmentList />
    </div>
  );
}
