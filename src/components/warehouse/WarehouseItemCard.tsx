'use client';

import React from 'react';
import Image from 'next/image';
import { WarehouseItem, WarehouseItemStatus } from '@prisma/client';
import { Package, Ruler, Weight, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import styles from './WarehouseItemCard.module.css';

interface WarehouseItemCardProps {
  item: WarehouseItem;
  onViewDetails: (item: WarehouseItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const WarehouseItemCard: React.FC<WarehouseItemCardProps> = ({ 
  item, 
  onViewDetails,
  isSelected = false,
  onToggleSelect
}) => {
  const photos = Array.isArray(item.photos) ? (item.photos as string[]) : [];
  const mainPhoto = photos[0];

  // Lógica de armazenamento
  const FREE_STORAGE_DAYS = 45;
  const arrivedAt = new Date(item.arrivedAt);
  const now = new Date();
  
  // Calcular dias passados
  const diffTime = now.getTime() - arrivedAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const daysRemaining = Math.max(0, FREE_STORAGE_DAYS - diffDays);
  const progress = Math.min(100, (diffDays / FREE_STORAGE_DAYS) * 100);
  
  const isExpired = diffDays >= FREE_STORAGE_DAYS;
  const isWarning = !isExpired && daysRemaining < 7;

  const statusMap: Record<WarehouseItemStatus, { label: string; variant: any }> = {
    [WarehouseItemStatus.AVAILABLE]: { label: 'Disponível', variant: 'success' },
    [WarehouseItemStatus.SELECTED_FOR_SHIPMENT]: { label: 'Selecionado', variant: 'warning' },
    [WarehouseItemStatus.SHIPPED]: { label: 'Enviado', variant: 'neutral' },
  };

  const status = statusMap[item.status];
  const isAvailable = item.status === WarehouseItemStatus.AVAILABLE;

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${!isAvailable ? styles.cardDisabled : ''}`} 
      data-testid={`warehouse-item-${item.id}`}
      onClick={() => isAvailable && onToggleSelect?.(item.id)}
    >
      <div className={styles.imageContainer}>
        {isAvailable && (
          <div className={styles.checkboxContainer} onClick={(e) => e.stopPropagation()}>
            <input 
              type="checkbox" 
              className={styles.checkbox} 
              checked={isSelected}
              onChange={() => onToggleSelect?.(item.id)}
              data-testid={`item-checkbox-${item.id}`}
            />
          </div>
        )}
        
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt={item.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Package className={styles.placeholderImage} size={48} strokeWidth={1} />
        )}
        <div className={styles.statusBadge}>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={item.name}>
          {item.name}
        </h3>

        <div className={styles.specs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>
              <Weight size={10} style={{ marginRight: 4 }} />
              Peso
            </span>
            <span className={styles.specValue}>{item.weightGrams}g</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>
              <Ruler size={10} style={{ marginRight: 4 }} />
              Volume
            </span>
            <span className={styles.specValue}>
              {item.lengthCm}x{item.widthCm}x{item.heightCm}cm
            </span>
          </div>
        </div>

        <div className={styles.storageSection}>
          <div className={styles.storageHeader}>
            <span className={styles.storageLabel}>
              <Calendar size={10} style={{ marginRight: 4 }} />
              Armazenamento Gratuito
            </span>
            <span 
              className={styles.daysLeft}
              style={{ color: isExpired ? 'var(--primary)' : isWarning ? '#f59e0b' : 'inherit' }}
            >
              {isExpired ? 'Vencido' : `${daysRemaining} dias`}
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div 
              className={`${styles.progressBar} ${isExpired ? styles.progressDanger : isWarning ? styles.progressWarning : ''}`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button 
          variant="secondary" 
          size="sm" 
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(item);
          }}
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};
