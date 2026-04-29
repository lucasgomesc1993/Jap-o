import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { 
  BarChart3, 
  ShoppingCart, 
  PackageSearch, 
  Truck, 
  Users, 
  CircleDollarSign, 
  Settings,
  LogOut,
  User,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { redirect } from 'next/navigation';

import { logoutAction } from '@/app/auth/actions';
import styles from './layout.module.css';
import { getOpenTicketsCount } from '@/lib/actions/admin-tickets';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (dbUser?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const openTicketsCount = await getOpenTicketsCount();

  const adminNavItems = [
    { id: 'dashboard', label: 'Painel Geral', href: '/admin', icon: <BarChart3 size={20} /> },
    { id: 'compras', label: 'Pedidos de Compra', href: '/admin/compras', icon: <ShoppingCart size={20} /> },
    { id: 'armazem', label: 'Controle de Armazém', href: '/admin/armazem', icon: <PackageSearch size={20} /> },
    { id: 'expedicao', label: 'Expedição / Envios', href: '/admin/expedicao', icon: <Truck size={20} /> },
    { id: 'clientes', label: 'Gestão de Clientes', href: '/admin/clientes', icon: <Users size={20} /> },
    { id: 'suporte', label: 'Suporte', href: '/admin/suporte', icon: <LifeBuoy size={20} />, badge: openTicketsCount },
    { id: 'financeiro', label: 'Financeiro', href: '/admin/financeiro', icon: <CircleDollarSign size={20} /> },
    { id: 'config', label: 'Configurações', href: '/admin/config', icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar 
          items={adminNavItems}
          logo={
            <div className={styles.logo}>
              Nippon<span>Admin</span>
            </div>
          }
        />
      </aside>

      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.topbarContent}>
            <div className={styles.badge}>
              <ShieldCheck size={16} />
              <span>Modo Administrador</span>
            </div>
            
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{dbUser.fullName}</span>
                <span className={styles.userRole}>Administrador</span>
              </div>
              <div className={styles.avatar}>
                <User size={20} />
              </div>
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
