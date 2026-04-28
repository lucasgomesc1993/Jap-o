'use client';

import styles from './ShipmentTimeline.module.css';
import { ShipmentStatus } from '@prisma/client';

interface ShipmentTimelineProps {
  currentStatus: ShipmentStatus;
}

const STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: 'PREPARING', label: 'Preparando' },
  { status: 'SHIPPED', label: 'Postado' },
  { status: 'IN_TRANSIT', label: 'Em Trânsito' },
  { status: 'IN_BRAZIL', label: 'No Brasil' },
  { status: 'OUT_FOR_DELIVERY', label: 'Saiu para Entrega' },
  { status: 'DELIVERED', label: 'Entregue' },
];

export default function ShipmentTimeline({ currentStatus }: ShipmentTimelineProps) {
  const currentIndex = STEPS.findIndex(step => step.status === currentStatus);

  return (
    <div className={styles.timeline}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        
        return (
          <div 
            key={step.status} 
            className={`${styles.step} ${isCompleted ? styles.stepCompleted : ''} ${isActive ? styles.stepActive : ''}`}
          >
            <div className={styles.dot} />
            <span className={styles.label}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
