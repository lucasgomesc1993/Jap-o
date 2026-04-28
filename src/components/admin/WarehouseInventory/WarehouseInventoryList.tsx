'use client';

import React, { useState } from 'react';
import { extendStorageDeadline, chargeStorageFee, contactClientAboutItem } from '@/lib/actions/admin-warehouse';

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
    <div>
      <div data-testid="filtros">Filtros aqui</div>
      <table data-testid="tabela-itens">
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
              <td>{item.user?.fullName}</td>
              <td>{item.name}</td>
              <td>
                <button onClick={() => handleExtend(item.id)} disabled={loading}>Prorrogar</button>
                <button onClick={() => handleCharge(item.id)} disabled={loading}>Cobrar</button>
                <button onClick={() => handleContact(item.id)} disabled={loading}>Contatar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div data-testid="paginacao">Total: {total} - Páginas: {pages}</div>
    </div>
  );
}
