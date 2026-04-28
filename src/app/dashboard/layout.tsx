'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { Package, Warehouse, Send, Wallet, LifeBuoy, LogOut, Menu, User, ShoppingCart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { logoutAction } from '@/app/auth/actions';
import styles from './layout.module.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <Package size={20} /> },
  { id: 'pedidos', label: 'Meus Pedidos', href: '/dashboard/orders', icon: <ShoppingCart size={20} /> },
  { id: 'armazem', label: 'Meu Armazém', href: '/dashboard/armazem', icon: <Warehouse size={20} /> },
  { id: 'envios', label: 'Meus Envios', href: '/dashboard/envios', icon: <Send size={20} /> },
  { id: 'carteira', label: 'Minha Carteira', href: '/dashboard/wallet', icon: <Wallet size={20} /> },
  { id: 'suporte', label: 'Suporte', href: '/dashboard/suporte', icon: <LifeBuoy size={20} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Encontrar o ID ativo baseado no pathname
  const activeId = navItems.find(item => pathname === item.href)?.id || 'dashboard';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar 
          items={navItems}
          activeItemId={activeId}
          onItemClick={(item) => router.push(item.href)}
          logo={
            <div className={styles.logo}>
              Nippon<span>Box</span>
            </div>
          }
        />
      </aside>

      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.topbarContent}>
            <button className={styles.mobileMenu}>
              <Menu size={24} />
            </button>
            
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Olá, Cliente</span>
                <span className={styles.userRole}>Nível 1</span>
              </div>
              <button className={styles.avatar}>
                <User size={20} />
              </button>
              <form action={logoutAction}>
                <button type="submit" className={styles.logoutBtn} title="Sair">
                  <LogOut size={20} />
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
