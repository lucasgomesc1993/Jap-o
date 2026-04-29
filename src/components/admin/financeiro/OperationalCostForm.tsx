'use client';

import { useState } from 'react';
import { addOperationalCost } from '@/lib/actions/admin-finance';
import styles from './OperationalCostForm.module.css';

export function OperationalCostForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      date: new Date(formData.get('date') as string),
      category: formData.get('category') as string,
    };

    try {
      await addOperationalCost(data);
      alert('Custo adicionado com sucesso!');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert('Erro ao adicionar custo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h3>Adicionar Custo Operacional</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Descrição</label>
          <input name="description" required className={styles.input} placeholder="Ex: Aluguel" />
        </div>
        <div className={styles.field}>
          <label>Valor (R$)</label>
          <input name="amount" type="number" step="0.01" required className={styles.input} />
        </div>
        <div className={styles.field}>
          <label>Data</label>
          <input name="date" type="date" required className={styles.input} defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
        <div className={styles.field}>
          <label>Categoria</label>
          <select name="category" className={styles.input}>
            <option value="ALUGUEL">Aluguel</option>
            <option value="MARKETING">Marketing</option>
            <option value="SOFTWARE">Softwares</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
    </div>
  );
}
