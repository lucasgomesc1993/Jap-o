import React from 'react';
import { getAdminTicketDetails } from '@/lib/actions/admin-tickets';
import { AdminTicketDetails } from '@/components/admin/tickets/AdminTicketDetails';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Chamado ${id.slice(0, 8)} | Admin NipponBox`,
  };
}

export default async function AdminTicketDetailsPage({ params }: PageProps) {
  const { id } = await params;
  try {
    const ticket = await getAdminTicketDetails(id);
    
    if (!ticket) {
      notFound();
    }

    return (
      <div className="admin-page">
        <AdminTicketDetails ticket={ticket} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
