'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { WarehouseItem, ExtraService, ExtraServiceType, Wallet } from '@prisma/client';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/stores/toast.store';
import { requestExtraService } from '@/lib/actions/warehouse';
import styles from './WarehouseItemDetails.module.css';

interface WarehouseItemDetailsProps {
  item: WarehouseItem & { extraServices?: ExtraService[] };
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_CONFIGS: Record<ExtraServiceType, { label: string; price: number; description: string }> = {
  EXTRA_PHOTO: { 
    label: 'Foto Extra', 
    price: 5, 
    description: 'Receba fotos adicionais detalhadas do seu produto.' 
  },
  QUALITY_CHECK: { 
    label: 'Quality Check', 
    price: 10, 
    description: 'Verificação minuciosa do estado do item e funcionamento.' 
  },
  REMOVE_PACKAGING: { 
    label: 'Remoção Embalagem', 
    price: 5, 
    description: 'Removemos a caixa original para reduzir o peso e volume do frete.' 
  },
  EXTRA_PROTECTION: { 
    label: 'Proteção Extra', 
    price: 8, 
    description: 'Plástico bolha reforçado e proteção adicional nos cantos.' 
  },
};

const serviceTypeLabels: Record<ExtraServiceType, string> = {
  EXTRA_PHOTO: 'Fotos Extras',
  QUALITY_CHECK: 'Verificação de Qualidade',
  REMOVE_PACKAGING: 'Remoção de Embalagem',
  EXTRA_PROTECTION: 'Proteção Extra',
};

export const WarehouseItemDetails: React.FC<WarehouseItemDetailsProps> = ({ 
  item, 
  wallet,
  isOpen, 
  onClose 
}) => {
  const photos = Array.isArray(item.photos) ? (item.photos as string[]) : [];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isConfirming, setIsConfirming] = useState<ExtraServiceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mainPhoto = photos[activePhotoIndex] || null;
  const balance = wallet?.balance ? Number(wallet.balance) : 0;

  const handleRequestService = async (type: ExtraServiceType) => {
    setIsLoading(true);
    try {
      const result = await requestExtraService({ warehouseItemId: item.id, type });
      if ('error' in result) {
        toast.error(result.error || 'Erro ao solicitar serviço');
      } else {
        toast.success(`Serviço ${SERVICE_CONFIGS[type].label} solicitado com sucesso!`);
        setIsConfirming(null);
      }
    } catch (error) {
      toast.error('Erro inesperado ao solicitar serviço');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Solicitar Novos Serviços */}
        {item.status === 'AVAILABLE' && (
          <section className={styles.requestSection}>
            <h4 className={styles.sectionTitle}>Solicitar Novos Serviços</h4>
            <div className={styles.servicesGrid}>
              {(Object.keys(SERVICE_CONFIGS) as ExtraServiceType[]).map((type) => {
                const config = SERVICE_CONFIGS[type];
                const alreadyRequested = item.extraServices?.some(s => s.type === type);
                const canAfford = balance >= config.price;

                return (
                  <div key={type} className={styles.requestCard}>
                    <div className={styles.requestInfo}>
                      <span className={styles.requestLabel}>{config.label}</span>
                      <span className={styles.requestPrice}>R$ {config.price.toFixed(2)}</span>
                    </div>
                    <p className={styles.requestDescription}>{config.description}</p>
                    <Button
                      size="sm"
                      variant={alreadyRequested ? "ghost" : "secondary"}
                      disabled={alreadyRequested || !canAfford || isLoading}
                      onClick={() => setIsConfirming(type)}
                      className={styles.requestButton}
                    >
                      {alreadyRequested ? 'Já solicitado' : !canAfford ? 'Saldo insuficiente' : 'Solicitar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Serviços Solicitados */}
        <section className={styles.servicesSection}>
          <h4 className={styles.sectionTitle}>Serviços Extras Solicitados</h4>
          <div className={styles.servicesList}>
            {item.extraServices && item.extraServices.length > 0 ? (
              item.extraServices.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{SERVICE_CONFIGS[service.type].label}</span>
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

      {/* Modal de Confirmação */}
      <Modal 
        isOpen={!!isConfirming} 
        onClose={() => !isLoading && setIsConfirming(null)}
        title="Confirmar Serviço Extra"
        size="sm"
      >
        {isConfirming && (
          <div className={styles.confirmContent}>
            <p>
              Deseja solicitar o serviço <strong>{SERVICE_CONFIGS[isConfirming].label}</strong>?
            </p>
            <div className={styles.confirmPrice}>
              <span>Valor a ser debitado:</span>
              <strong>R$ {SERVICE_CONFIGS[isConfirming].price.toFixed(2)}</strong>
            </div>
            <div className={styles.confirmActions}>
              <Button 
                variant="ghost" 
                onClick={() => setIsConfirming(null)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleRequestService(isConfirming)}
                loading={isLoading}
              >
                Confirmar e Pagar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  );
};
