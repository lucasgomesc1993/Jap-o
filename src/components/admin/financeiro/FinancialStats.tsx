import styles from './FinancialStats.module.css';

interface StatsProps {
  revenue: {
    serviceFees: number;
    freightMargin: number;
    extraServices: number;
    storageFees: number;
    total: number;
  };
  costs: {
    realPurchases: number;
    realFreight: number;
    operational: number;
    total: number;
  };
  netProfit: number;
}

export function FinancialStats({ revenue, costs, netProfit }: StatsProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3>Receita</h3>
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.label}>Taxas de Serviço</span>
            <span className={styles.value}>{formatCurrency(revenue.serviceFees)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Margem de Frete</span>
            <span className={styles.value}>{formatCurrency(revenue.freightMargin)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Serviços Extras</span>
            <span className={styles.value}>{formatCurrency(revenue.extraServices)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Armazenamento</span>
            <span className={styles.value}>{formatCurrency(revenue.storageFees)}</span>
          </div>
          <div className={`${styles.card} ${styles.total}`}>
            <span className={styles.label}>Total Receita</span>
            <span className={styles.value}>{formatCurrency(revenue.total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Custos</h3>
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.label}>Compras (Real)</span>
            <span className={styles.value}>{formatCurrency(costs.realPurchases)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Fretes (Real)</span>
            <span className={styles.value}>{formatCurrency(costs.realFreight)}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Operacional</span>
            <span className={styles.value}>{formatCurrency(costs.operational)}</span>
          </div>
          <div className={`${styles.card} ${styles.totalCost}`}>
            <span className={styles.label}>Total Custos</span>
            <span className={styles.value}>{formatCurrency(costs.total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.profitSection}>
        <div className={`${styles.profitCard} ${netProfit >= 0 ? styles.positive : styles.negative}`}>
          <span className={styles.label}>Lucro Líquido</span>
          <span className={styles.value}>{formatCurrency(netProfit)}</span>
        </div>
      </div>
    </div>
  );
}
