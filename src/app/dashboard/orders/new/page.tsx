import { Metadata } from 'next';
import { OrderStepper } from '@/components/orders/OrderStepper';
import { getExchangeRate } from '@/lib/utils/exchange-rate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Novo Pedido | NipponBox',
  description: 'Crie um novo pedido de compra no Japão.',
};

export default async function NewOrderPage() {
  const exchangeRate = await getExchangeRate();

  return (
    <main>
      <OrderStepper initialExchangeRate={exchangeRate} />
    </main>
  );
}
