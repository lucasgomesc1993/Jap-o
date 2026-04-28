'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, getAdminAlerts } from '@/lib/actions/admin';
import { KPIStats } from './KPIStats';
import { AlertsList } from './AlertsList';
import styles from '@/app/admin/page.module.css';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, alertsData] = await Promise.all([
          getAdminStats(),
          getAdminAlerts()
        ]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <KPIStats stats={stats} isLoading={isLoading} />
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Alertas e Atenção</h2>
          <p className={styles.sectionSubtitle}>Itens e pedidos que precisam de ação imediata.</p>
        </div>
        <AlertsList alerts={alerts} isLoading={isLoading} />
      </section>
    </>
  );
}
