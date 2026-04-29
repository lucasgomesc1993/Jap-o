'use client';

import React from 'react';
import styles from './Sidebar.module.css';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItemId?: string;
  onItemClick?: (item: SidebarItem) => void;
  logo?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeItemId,
  onItemClick,
  className = '',
}) => {
  return (
    <nav className={`${styles.sidebar} ${className}`} aria-label="NipponBox Terminal">
      <div className={styles.logoSection}>
        <div className={styles.brand}>
          <span className={styles.brandMain}>NIPPON</span>
          <span className={styles.brandSub}>BOX</span>
        </div>
        <div className={styles.systemInfo}>
          <span className={styles.crimsonDot} />
          <span>SYS.V1 // PROXY_ACCESS</span>
        </div>
      </div>

      <div className={styles.navSection}>
        <div className={styles.sectionLabel}>MENU_NAVIGATION</div>
        <ul className={styles.nav} role="list">
          {items.map((item, index) => {
            const isActive = item.id === activeItemId;
            const itemNumber = (index + 1).toString().padStart(2, '0');
            
            return (
              <li key={item.id} role="listitem">
                <a
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    if (onItemClick) {
                      e.preventDefault();
                      onItemClick(item);
                    }
                  }}
                >
                  <span className={styles.itemIndex}>[{itemNumber}]</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                  {isActive && <div className={styles.activeIndicator} />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.footer}>
        <div className={styles.statusLine}>
          <span className={styles.statusLabel}>STATUS:</span>
          <span className={styles.statusValue}>CONNECTED</span>
        </div>
      </div>
    </nav>
  );
};
