'use client';

import React, { useState } from 'react';
import { WarehouseItem, ExtraService } from '@prisma/client';
import { WarehouseItemList } from '@/components/warehouse/WarehouseItemList';
import { WarehouseItemDetails } from '@/components/warehouse/WarehouseItemDetails';

interface WarehouseClientProps {
  items: (WarehouseItem & { extraServices: ExtraService[] })[];
}

export const WarehouseClient: React.FC<WarehouseClientProps> = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState<(WarehouseItem & { extraServices: ExtraService[] }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (item: WarehouseItem) => {
    const fullItem = items.find(i => i.id === item.id);
    if (fullItem) {
      setSelectedItem(fullItem);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <WarehouseItemList items={items} onViewDetails={handleViewDetails} />
      
      {selectedItem && (
        <WarehouseItemDetails 
          item={selectedItem} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};
