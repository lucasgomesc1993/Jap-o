'use client';

import React from 'react';
import styles from './Sidebar.module.css';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
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
  logo,
  className = '',
}) => {
  return (
    <nav className={`${styles.sidebar} ${className}`} aria-label="Menu lateral">
      <div className={styles.crimsonStripe} />
      {logo && <div className={styles.logo}>{logo}</div>}
      <ul className={styles.nav} role="list">
        {items.map((item) => {
          const isActive = item.id === activeItemId;
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
                {isActive && <span className={styles.activeBar} />}
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                <span className={styles.label}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
