'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/auth/actions';
import styles from './layout.module.css';
import Link from 'next/link';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'pedidos', label: 'Pedidos', href: '/dashboard/orders' },
  { id: 'armazem', label: 'Armazém', href: '/dashboard/armazem' },
  { id: 'envios', label: 'Envios', href: '/dashboard/envios' },
  { id: 'carteira', label: 'Carteira', href: '/dashboard/wallet' },
  { id: 'suporte', label: 'Suporte', href: '/dashboard/tickets' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeId = navItems.find(item => pathname === item.href)?.id || 'dashboard';

  const handleNavItemClick = (item: { href: string }) => {
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebarWrapper}>
        <Sidebar 
          items={navItems}
          activeItemId={activeId}
          onItemClick={handleNavItemClick}
        />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <button 
            className={styles.closeMenuBtn}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            [ FECHAR ]
          </button>
          
          <nav className={styles.mobileNav}>
            {navItems.map((item, index) => {
              const isActive = item.href === pathname;
              const itemNumber = (index + 1).toString().padStart(2, '0');
              
              return (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span style={{ fontSize: '0.4em', verticalAlign: 'middle', marginRight: '1rem', color: 'var(--color-primary)' }}>
                    {itemNumber}
                  </span>
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.topbarContent}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              [ MENU ]
            </button>
            
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                USER: <span>LUCAS GOMES</span>
              </div>
              
              <form action={logoutAction}>
                <button type="submit" className={styles.logoutBtn}>
                  [ SAIR ]
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
