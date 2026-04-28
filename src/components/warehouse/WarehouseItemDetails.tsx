'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { WarehouseItem, ExtraService, ExtraServiceType } from '@prisma/client';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './WarehouseItemDetails.module.css';

interface WarehouseItemDetailsProps {
  item: WarehouseItem & { extraServices?: ExtraService[] };
  isOpen: boolean;
  onClose: () => void;
}

const serviceTypeLabels: Record<ExtraServiceType, string> = {
  EXTRA_PHOTO: 'Fotos Extras',
  QUALITY_CHECK: 'Verificação de Qualidade',
  REMOVE_PACKAGING: 'Remoção de Embalagem',
  EXTRA_PROTECTION: 'Proteção Extra',
};

export const WarehouseItemDetails: React.FC<WarehouseItemDetailsProps> = ({ 
  item, 
  isOpen, 
  onClose 
}) => {
  const photos = Array.isArray(item.photos) ? (item.photos as string[]) : [];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const mainPhoto = photos[activePhotoIndex] || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} size="lg">
      <div className={styles.modalContent}>
        {/* Galeria de Fotos */}
        <section className={styles.gallerySection}>
          <div className={styles.mainPhotoContainer}>
            {mainPhoto ? (
              <Image
                src={mainPhoto}
                alt={item.name}
                fill
                className={styles.mainPhoto}
                priority
              />
            ) : (
              <div className={styles.emptyServices}>Sem fotos disponíveis</div>
            )}
          </div>
          
          {photos.length > 1 && (
            <div className={styles.thumbnails}>
              {photos.map((photo, index) => (
                <div 
                  key={index}
                  className={`${styles.thumbnail} ${activePhotoIndex === index ? styles.thumbnailActive : ''}`}
                  onClick={() => setActivePhotoIndex(index)}
                >
                  <Image
                    src={photo}
                    alt={`${item.name} thumbnail ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Informações Técnicas */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Peso</span>
            <span className={styles.infoValue}>{item.weightGrams}g</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Dimensões (CxLxA)</span>
            <span className={styles.infoValue}>
              {item.lengthCm} x {item.widthCm} x {item.heightCm} cm
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data de Chegada</span>
            <span className={styles.infoValue}>
              {format(new Date(item.arrivedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID do Item</span>
            <span className={styles.infoValue}>{item.id.split('-')[0].toUpperCase()}</span>
          </div>
        </div>

        {/* Serviços Extras */}
        <section className={styles.servicesSection}>
          <h4 className={styles.sectionTitle}>Serviços Extras</h4>
          <div className={styles.servicesList}>
            {item.extraServices && item.extraServices.length > 0 ? (
              item.extraServices.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{serviceTypeLabels[service.type]}</span>
                    <span className={styles.serviceDate}>
                      Solicitado em {format(new Date(service.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <Badge variant={service.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {service.status === 'COMPLETED' ? 'Concluído' : 'Solicitado'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className={styles.emptyServices}>
                Nenhum serviço extra solicitado para este item.
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
};
