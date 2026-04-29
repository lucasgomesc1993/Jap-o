'use client';

import { useState, useEffect } from 'react';
import { getAdminCustomers } from '@/lib/actions/admin-customers';
import { formatCurrencyBRL } from '@/lib/utils/formatters';
import { Button, Badge, Input } from '@/components/ui';
import { toast } from '@/stores/toast.store';
import Link from 'next/link';
import styles from './CustomerList.module.css';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  blocked: boolean;
  wallet: { balance: any } | null;
  _count: {
    orders: number;
    tickets: number;
  };
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAdminCustomers(page, search);
      setCustomers(data.customers as any);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.search}>
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Saldo</th>
              <th>Pedidos</th>
              <th>Chamados</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.empty}>Carregando...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>Nenhum cliente encontrado.</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{customer.fullName}</span>
                      <span className={styles.clientEmail}>{customer.email}</span>
                    </div>
                  </td>
                  <td>{formatCurrencyBRL(Number(customer.wallet?.balance || 0))}</td>
                  <td>{customer._count.orders}</td>
                  <td>{customer._count.tickets}</td>
                  <td>
                    <Badge variant={customer.blocked ? 'error' : 'success'}>
                      {customer.blocked ? 'BLOQUEADO' : 'ATIVO'}
                    </Badge>
                  </td>
                  <td>
                    <Link href={`/admin/clientes/${customer.id}`}>
                      <Button size="sm" variant="ghost">Ver Detalhes</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </Button>
          <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
