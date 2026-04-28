'use client';

import React from 'react';
import { WarehouseItem } from '@prisma/client';
import { PackageSearch } from 'lucide-react';
import { WarehouseItemCard } from './WarehouseItemCard';
import styles from './WarehouseItemList.module.css';

interface WarehouseItemListProps {
  items: WarehouseItem[];
  onViewDetails: (item: WarehouseItem) => void;
}

export const WarehouseItemList: React.FC<WarehouseItemListProps> = ({ items, onViewDetails }) => {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState} data-testid="warehouse-empty-state">
        <PackageSearch size={48} className={styles.emptyIcon} strokeWidth={1} />
        <h3 className={styles.emptyTitle}>Armazém vazio</h3>
        <p className={styles.emptyDescription}>
          Você ainda não possui itens no armazém. Quando seus pedidos chegarem, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((item) => (
          <WarehouseItemCard 
            key={item.id} 
            item={item} 
            onViewDetails={onViewDetails} 
          />
        ))}
      </div>
    </div>
  );
};
