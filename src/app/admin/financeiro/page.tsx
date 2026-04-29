import { getFinancialReport } from '@/lib/actions/admin-finance';
import { FinancialStats } from '@/components/admin/financeiro/FinancialStats';
import { FinancialCharts } from '@/components/admin/financeiro/FinancialCharts';
import { LiabilitiesTable } from '@/components/admin/financeiro/LiabilitiesTable';
import { ExportButtons } from '@/components/admin/financeiro/ExportButtons';
import { OperationalCostForm } from '@/components/admin/financeiro/OperationalCostForm';
import styles from './page.module.css';

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = {
    dateFrom: params.from ? new Date(params.from) : undefined,
    dateTo: params.to ? new Date(params.to) : undefined,
  };

  const data = await getFinancialReport(filter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Relatórios Financeiros</h1>
          <p className={styles.subtitle}>Visão geral de receitas, custos e lucro operacional.</p>
        </div>
        <ExportButtons data={data} filter={filter} />
      </header>

      <form className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Início</label>
          <input 
            type="date" 
            name="from" 
            defaultValue={params.from} 
            className={styles.input}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Fim</label>
          <input 
            type="date" 
            name="to" 
            defaultValue={params.to} 
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.filterButton}>Filtrar</button>
      </form>

      <FinancialStats 
        revenue={data.revenue} 
        costs={data.costs} 
        netProfit={data.netProfit} 
      />

      <FinancialCharts 
        revenueByCategory={data.charts.revenueByCategory}
        revenueOverTime={data.charts.revenueOverTime}
      />

      <OperationalCostForm />

      <LiabilitiesTable 
        totalBalance={data.liabilities.totalWalletBalance}
        topWallets={data.liabilities.topWallets}
      />
    </div>
  );
}
