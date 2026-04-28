import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonBaseProps {
  className?: string;
}

interface SkeletonTextProps extends SkeletonBaseProps {
  lines?: number;
  width?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  width = '100%',
  className = '',
}) => {
  return (
    <div className={`${styles.skeletonGroup} ${className}`} aria-busy="true" role="status">
      <span className={styles.srOnly}>Carregando...</span>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={styles.skeletonLine}
          style={{
            width: i === lines - 1 ? '60%' : width,
          }}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps extends SkeletonBaseProps {
  height?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = '200px',
  className = '',
}) => {
  return (
    <div
      className={`${styles.skeletonCard} ${className}`}
      style={{ height }}
      aria-busy="true"
      role="status"
    >
      <span className={styles.srOnly}>Carregando...</span>
      <div className={styles.skeletonCardImage} />
      <div className={styles.skeletonCardBody}>
        <div className={styles.skeletonLine} style={{ width: '70%' }} />
        <div className={styles.skeletonLine} style={{ width: '50%' }} />
      </div>
    </div>
  );
};

interface SkeletonTableProps extends SkeletonBaseProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`${styles.skeletonTable} ${className}`} aria-busy="true" role="status">
      <span className={styles.srOnly}>Carregando tabela...</span>
      <div className={styles.skeletonTableHeader}>
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className={styles.skeletonCell} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className={styles.skeletonTableRow}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className={styles.skeletonCell} />
          ))}
        </div>
      ))}
    </div>
  );
};

interface SkeletonProps extends SkeletonBaseProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}) => {
  return (
    <div
      className={`${styles.skeletonBase} ${className}`}
      style={{ width, height, borderRadius }}
      aria-busy="true"
      role="status"
    >
      <span className={styles.srOnly}>Carregando...</span>
    </div>
  );
};
