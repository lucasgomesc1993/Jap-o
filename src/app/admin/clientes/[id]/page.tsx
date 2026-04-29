import { getAdminCustomerDetails } from '@/lib/actions/admin-customers';
import { CustomerDetails } from '@/components/admin/customers/CustomerDetails';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Perfil do Cliente | NipponBox Admin',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();

  if (!admin) return null;

  try {
    const customer = await getAdminCustomerDetails(id);
    return <CustomerDetails customer={customer} adminId={admin.id} />;
  } catch (error) {
    notFound();
  }
}
