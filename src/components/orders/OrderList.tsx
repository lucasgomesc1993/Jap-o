'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, useToast } from '@/components/ui';
import { ShoppingBag, Calendar, ExternalLink, XCircle, ArrowRight, Package } from 'lucide-react';
import { cancelOrder } from '@/lib/actions/orders';
import styles from './OrderList.module.css';

interface Order {
  id: string;
  productName: string;
  productImage: string | null;
  productUrl: string;
  status: string;
  totalBrl: number;
  quantity: number;
  createdAt: string;
  variation: string | null;
  notes: string | null;
}

interface OrderListProps {
  orders: Order[];
}

const statusMap: Record<string, { label: string, variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' }> = {
  AWAITING_PURCHASE: { label: 'Aguardando Compra', variant: 'warning' },
  PURCHASED: { label: 'Comprado', variant: 'info' },
  IN_TRANSIT_TO_WAREHOUSE: { label: 'Em Trânsito p/ Armazém', variant: 'info' },
  IN_WAREHOUSE: { label: 'No Armazém', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
};

export function OrderList({ orders: initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { addToast } = useToast();

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido? O valor será reembolsado em sua carteira.')) return;

    setIsLoading(true);
    try {
      await cancelOrder(orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
      }
      addToast({
        title: 'Pedido Cancelado',
        message: 'O valor foi estornado para sua carteira.',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Falha ao cancelar pedido.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Acompanhe o status das suas compras no Japão.</p>
        </div>
        <div className={styles.filters}>
          <select 
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Todos os Pedidos</option>
            <option value="AWAITING_PURCHASE">Aguardando Compra</option>
            <option value="PURCHASED">Comprado</option>
            <option value="IN_WAREHOUSE">No Armazém</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </header>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={64} strokeWidth={1} />
          <p>Nenhum pedido encontrado nesta categoria.</p>
          <Button href="/dashboard/orders/new" variant="primary">Criar Novo Pedido</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredOrders.map((order) => (
            <Card key={order.id} className={styles.orderCard}>
              <div className={styles.cardMain}>
                <div className={styles.imageBox}>
                  {order.productImage ? (
                    <img src={order.productImage} alt={order.productName} />
                  ) : (
                    <Package size={32} strokeWidth={1} />
                  )}
                </div>
                <div className={styles.info}>
                  <div className={styles.cardHeader}>
                    <Badge variant={statusMap[order.status]?.variant || 'neutral'}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                    <span className={styles.date}>{formatDate(order.createdAt)}</span>
                  </div>
                  <h3 className={styles.productName}>{order.productName}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatCurrency(order.totalBrl)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className={styles.detailBtn}
                    >
                      Detalhes <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Detalhes do Pedido"
      >
        {selectedOrder && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <Badge variant={statusMap[selectedOrder.status]?.variant || 'neutral'}>
                {statusMap[selectedOrder.status]?.label || selectedOrder.status}
              </Badge>
              <span className={styles.orderId}>ID: {selectedOrder.id.split('-')[0].toUpperCase()}</span>
            </div>

            <div className={styles.productDetails}>
              {selectedOrder.productImage && (
                <img src={selectedOrder.productImage} alt={selectedOrder.productName} className={styles.modalImg} />
              )}
              <div className={styles.modalInfo}>
                <h4>{selectedOrder.productName}</h4>
                <a href={selectedOrder.productUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Ver na loja original <ExternalLink size={12} />
                </a>
                <div className={styles.specs}>
                  {selectedOrder.variation && <span>Var: {selectedOrder.variation}</span>}
                  <span>Qtd: {selectedOrder.quantity}</span>
                </div>
              </div>
            </div>

            <div className={styles.costs}>
              <div className={styles.costLine}>
                <span>Valor Total</span>
                <strong>{formatCurrency(selectedOrder.totalBrl)}</strong>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className={styles.notes}>
                <h5>Observações</h5>
                <p>{selectedOrder.notes}</p>
              </div>
            )}

            <div className={styles.modalActions}>
              {selectedOrder.status === 'AWAITING_PURCHASE' && (
                <Button 
                  variant="ghost" 
                  className={styles.cancelBtn}
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  loading={isLoading}
                >
                  <XCircle size={16} /> Cancelar Pedido
                </Button>
              )}
              <Button fullWidth onClick={() => setIsModalOpen(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
