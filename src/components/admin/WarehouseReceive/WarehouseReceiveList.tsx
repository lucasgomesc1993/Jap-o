'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Package, User, Calendar, Ruler, Weight } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { ReceiveModal } from './ReceiveModal';
import styles from './WarehouseReceiveList.module.css';

interface WarehouseReceiveListProps {
  initialOrders: any[];
}

export function WarehouseReceiveList({ initialOrders }: WarehouseReceiveListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const openReceiveModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <Input
            placeholder="Buscar por nome, código ou cliente..."
            defaultValue={searchParams.get('q') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {initialOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} strokeWidth={1} />
            <p>Nenhum pedido em trânsito encontrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido / Cliente</th>
                <th>Produto</th>
                <th>Status / Extras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {initialOrders.map((order) => (
                <tr key={order.id} className={styles.row}>
                  <td>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                      <div className={styles.customerInfo}>
                        <User size={14} />
                        <span>{order.user.fullName}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{order.productName}</span>
                      {order.variation && (
                        <span className={styles.variation}>Var: {order.variation}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.statusSection}>
                      <Badge variant="info">Em Trânsito</Badge>
                      {order.warehouseItem?.extraServices.map((service: any) => (
                        <Badge key={service.id} variant="warning">
                          QC Solicitado
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => openReceiveModal(order)}
                    >
                      Receber
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <ReceiveModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
