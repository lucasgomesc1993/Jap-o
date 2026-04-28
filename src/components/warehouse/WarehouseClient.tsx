'use client';

import React, { useState, useMemo } from 'react';
import { WarehouseItem, ExtraService, Wallet, Address } from '@prisma/client';
import { WarehouseItemList } from '@/components/warehouse/WarehouseItemList';
import { WarehouseItemDetails } from '@/components/warehouse/WarehouseItemDetails';
import { ShipmentWizard } from '@/components/warehouse/ShipmentWizard';
import { Button } from '@/components/ui/Button/Button';
import { Package, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './WarehouseClient.module.css';

interface WarehouseClientProps {
  items: (WarehouseItem & { extraServices: ExtraService[] })[];
  wallet: Wallet | null;
  addresses: Address[];
}

export const WarehouseClient: React.FC<WarehouseClientProps> = ({ items, wallet, addresses }) => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<(WarehouseItem & { extraServices: ExtraService[] }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const handleViewDetails = (item: WarehouseItem) => {
    const fullItem = items.find(i => i.id === item.id);
    if (fullItem) {
      setSelectedItem(fullItem);
      setIsModalOpen(true);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectedItems = useMemo(() => {
    return items.filter(item => selectedItemIds.includes(item.id));
  }, [items, selectedItemIds]);

  const totalWeight = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.weightGrams, 0);
  }, [selectedItems]);

  const handleCreateShipment = () => {
    setIsWizardOpen(true);
  };

  return (
    <div className={styles.wrapper}>
      <WarehouseItemList 
        items={items} 
        onViewDetails={handleViewDetails} 
        selectedItemIds={selectedItemIds}
        onToggleSelect={toggleSelectItem}
      />
      
      {selectedItem && (
        <WarehouseItemDetails 
          item={selectedItem} 
          wallet={wallet}
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isWizardOpen && (
        <ShipmentWizard 
          items={selectedItems}
          addresses={addresses}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={() => {
            setIsWizardOpen(false);
            setSelectedItemIds([]);
            router.refresh();
          }}
        />
      )}

      {selectedItemIds.length > 0 && !isWizardOpen && (
        <div className={styles.summaryContainer} data-testid="shipment-summary">
          <div className={styles.summaryContent}>
            <div className={styles.summaryInfo}>
              <div className={styles.summaryCount}>
                <Package size={20} className={styles.summaryIcon} />
                <span><strong>{selectedItemIds.length}</strong> {selectedItemIds.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
              </div>
              <div className={styles.summaryWeight}>
                <span>Peso Total: <strong>{totalWeight}g</strong></span>
              </div>
            </div>
            <Button 
              onClick={handleCreateShipment} 
              className={styles.summaryButton}
            >
              Criar Envio
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
