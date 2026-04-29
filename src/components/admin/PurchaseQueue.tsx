'use client';

import { useState, useEffect } from 'react';
import { getAdminAwaitingPurchaseOrders, markOrderAsInTransit } from '@/lib/actions/admin-orders';
import { formatCurrencyBRL, formatDate } from '@/lib/utils/formatters';
import { Button, Badge, Input } from '@/components/ui';
import { toast } from '@/stores/toast.store';
import { MarkPurchasedModal } from './MarkPurchasedModal';
import styles from './PurchaseQueue.module.css';

interface Order {
  id: string;
  productName: string;
  productUrl: string;
  variation: string | null;
  notes: string | null;
  totalBrl: any; // Prisma Decimal
  createdAt: Date;
  status: string;
  user: {
    fullName: string;
    email: string;
  };
}

export function PurchaseQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await getAdminAwaitingPurchaseOrders(search);
      setOrders(data as any);
    } catch (error) {
      toast.error('Erro ao carregar fila de compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleMarkAsInTransit = async (orderId: string) => {
    try {
      await markOrderAsInTransit(orderId);
      toast.success('Pedido marcado como em trânsito!');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.search}>
          <Input
            placeholder="Buscar por cliente ou produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Produto</th>
              <th>Detalhes</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  Nenhum pedido na fila.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{order.user.fullName}</span>
                      <span className={styles.clientEmail}>{order.user.email}</span>
                    </div>
                  </td>
                  <td>
                    <a
                      href={order.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.productLink}
                    >
                      {order.productName}
                    </a>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      {order.variation && <div><strong>Var:</strong> {order.variation}</div>}
                      {order.notes && <div><strong>Obs:</strong> {order.notes}</div>}
                    </div>
                  </td>
                  <td>{formatCurrencyBRL(Number(order.totalBrl))}</td>
                  <td>
                    <Badge variant={order.status === 'PURCHASED' ? 'success' : 'warning'}>
                      {order.status === 'PURCHASED' ? 'COMPRADO' : 'AGUARDANDO COMPRA'}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {order.status === 'AWAITING_PURCHASE' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                        >
                          Marcar Comprado
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsInTransit(order.id)}
                        >
                          Em Trânsito
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <MarkPurchasedModal
          orderId={selectedOrder.id}
          productName={selectedOrder.productName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
