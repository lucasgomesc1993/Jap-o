import styles from './LiabilitiesTable.module.css';

interface LiabilitiesProps {
  totalBalance: number;
  topWallets: { name: string; balance: number }[];
}

export function LiabilitiesTable({ totalBalance, topWallets }: LiabilitiesProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Saldos em Carteira (Passivo)</h3>
        <div className={styles.totalBox}>
          <span className={styles.label}>Total em Custódia</span>
          <span className={styles.totalValue}>{formatCurrency(totalBalance)}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th className={styles.alignRight}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {topWallets.map((wallet, index) => (
              <tr key={index}>
                <td>{wallet.name}</td>
                <td className={styles.alignRight}>{formatCurrency(wallet.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
