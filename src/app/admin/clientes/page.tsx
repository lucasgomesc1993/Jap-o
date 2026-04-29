import { CustomerList } from '@/components/admin/customers/CustomerList';

export const metadata = {
  title: 'Gestão de Clientes | NipponBox Admin',
};

export default function AdminCustomersPage() {
  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px' }}>Clientes</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          Gerencie os usuários da plataforma, visualize saldos e históricos.
        </p>
      </header>

      <CustomerList />
    </div>
  );
}
