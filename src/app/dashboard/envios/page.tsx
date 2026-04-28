import { getShipments } from '@/lib/actions/shipment-details';
import ShipmentList from '@/components/shipments/ShipmentList';
import { Suspense } from 'react';

export const metadata = {
  title: 'Meus Envios | Nipponbox',
};

export default async function ShipmentsPage() {
  const shipments = await getShipments();

  return (
    <main style={{ padding: '40px' }}>
      <Suspense fallback={<div>Carregando envios...</div>}>
        <ShipmentList initialShipments={shipments} />
      </Suspense>
    </main>
  );
}
