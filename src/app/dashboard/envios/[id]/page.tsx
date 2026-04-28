import { getShipmentDetail } from '@/lib/actions/shipment-details';
import ShipmentDetails from '@/components/shipments/ShipmentDetails';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Envio #${id.slice(0, 8).toUpperCase()} | Nipponbox`,
  };
}

export default async function ShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const shipment = await getShipmentDetail(id);
    
    if (!shipment) {
      return notFound();
    }

    return (
      <main style={{ padding: '40px' }}>
        <Suspense fallback={<div>Carregando detalhes do envio...</div>}>
          <ShipmentDetails shipment={shipment} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
