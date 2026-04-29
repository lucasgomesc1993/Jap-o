'use client';

import React, { useState } from 'react';
import { extendStorageDeadline, chargeStorageFee, contactClientAboutItem } from '@/lib/actions/admin-warehouse';
import styles from './WarehouseInventoryList.module.css';

export function WarehouseInventoryList({ items, total, pages }: { items: any[], total: number, pages: number }) {
  const [loading, setLoading] = useState(false);

  const handleExtend = async (id: string) => {
    setLoading(true);
    await extendStorageDeadline(id, { days: 7, reason: 'Extensão solicitada' });
    setLoading(false);
  };

  const handleCharge = async (id: string) => {
    setLoading(true);
    await chargeStorageFee(id, { amount: 15, reason: 'Taxa de manutenção' });
    setLoading(false);
  };

  const handleContact = async (id: string) => {
    setLoading(true);
    await contactClientAboutItem(id, { subject: 'Aviso sobre seu item', message: 'Por favor verifique as pendências.' });
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div data-testid="filtros">Estoque: {total} itens</div>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table} data-testid="tabela-itens">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Item</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} data-testid="item-row">
                <td data-label="Cliente">{item.user?.fullName}</td>
                <td data-label="Item">{item.name}</td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => handleExtend(item.id)} disabled={loading}>Prorrogar</button>
                    <button onClick={() => handleCharge(item.id)} disabled={loading}>Cobrar</button>
                    <button onClick={() => handleContact(item.id)} disabled={loading}>Contatar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div data-testid="paginacao" className={styles.pagination}>Página 1 de {pages}</div>
    </div>
  );
}
