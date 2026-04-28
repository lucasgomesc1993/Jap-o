import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { OrderList } from '@/components/orders/OrderList';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Meus Pedidos | NipponBox',
  description: 'Acompanhe seus pedidos de compra no Japão.',
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Serializar para componente client
  const serializedOrders = orders.map(order => ({
    id: order.id,
    productName: order.productName,
    productImage: order.productImage,
    productUrl: order.productUrl,
    status: order.status,
    totalBrl: Number(order.totalBrl),
    quantity: order.quantity,
    createdAt: order.createdAt.toISOString(),
    variation: order.variation,
    notes: order.notes,
  }));

  return <OrderList orders={serializedOrders} />;
}
