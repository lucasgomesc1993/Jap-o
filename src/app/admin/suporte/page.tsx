import React from 'react';
import { getAdminTickets } from '@/lib/actions/admin-tickets';
import { AdminTicketList } from '@/components/admin/tickets/AdminTicketList';

export const metadata = {
  title: 'Suporte | Admin NipponBox',
  description: 'Gestão de chamados de suporte dos clientes.',
};

export default async function AdminSupportPage() {
  const { tickets, total, pages } = await getAdminTickets();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Gestão de Suporte</h1>
        <p>Acompanhe e responda aos chamados dos clientes.</p>
      </header>

      <AdminTicketList 
        initialTickets={tickets} 
        initialTotal={total} 
        initialPages={pages} 
      />
    </div>
  );
}
