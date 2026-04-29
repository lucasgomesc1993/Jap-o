'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarItem } from '@/components/ui/Sidebar/Sidebar';
import { Menu } from 'lucide-react';
import styles from './layout.module.css';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  navItems: SidebarItem[];
  userFullName: string;
  logoutAction: (formData: FormData) => void;
}

export default function AdminLayoutClient({ 
  children, 
  navItems, 
  userFullName,
  logoutAction
}: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebarWrapper} aria-label="Menu Admin Desktop">
        <Sidebar 
          items={navItems}
          ariaLabel="Navegação Admin (Desktop)"
          logo={
            <div className={styles.logo}>
              Nippon<span>Admin</span>
            </div>
          }
        />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <aside 
        className={`${styles.mobileSidebar} ${isMobileMenuOpen ? styles.mobileSidebarOpen : ''}`}
        aria-label="Menu Admin Mobile"
      >
        <Sidebar 
          items={navItems}
          onClose={() => setIsMobileMenuOpen(false)}
          showCloseButton={true}
          onItemClick={() => setIsMobileMenuOpen(false)}
          ariaLabel="Navegação Admin (Mobile)"
        />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.topbarContent}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>

            <div className={styles.badge}>
              <span>Modo Administrador</span>
            </div>
            
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userFullName}</span>
                <span className={styles.userRole}>Administrador</span>
              </div>
              <form action={logoutAction}>
                <button type="submit" className={styles.logoutBtn} title="Sair">
                  SAIR
                </button>
              </form>
            </div>
          </div>
        </header>

        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
