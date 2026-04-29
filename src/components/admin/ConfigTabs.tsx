'use client';

import React, { useState } from 'react';
import styles from './ConfigTabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ConfigTabsProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
}

export function ConfigTabs({ tabs, children }: ConfigTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={styles.container}>
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className={styles.content}>
        {children(activeTab)}
      </div>
    </div>
  );
}
