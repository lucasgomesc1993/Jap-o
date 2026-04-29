'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import styles from './FinancialCharts.module.css';

interface ChartsProps {
  revenueByCategory: { category: string; value: number }[];
  revenueOverTime: { date: string; value: number }[];
}

export function FinancialCharts({ revenueByCategory, revenueOverTime }: ChartsProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <div className={styles.chartBox}>
        <h3>Receita por Categoria</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              <Bar dataKey="value" fill="var(--color-foreground)">
                {revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000' : '#444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartBox}>
        <h3>Evolução da Receita</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-foreground)" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#000' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
