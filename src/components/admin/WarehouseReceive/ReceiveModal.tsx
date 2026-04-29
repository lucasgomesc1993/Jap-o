'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseReceiveSchema, type WarehouseReceiveInput } from '@/lib/validators/warehouse-receive.schema';
import { qualityCheckResultSchema, type QualityCheckResultInput } from '@/lib/validators/quality-check-result.schema';
import { confirmWarehouseReceipt } from '@/lib/actions/admin-warehouse';
import { toast } from '@/stores/toast.store';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './ReceiveModal.module.css';

interface ReceiveModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveModal({ order, isOpen, onClose }: ReceiveModalProps) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [qcPhoto, setQcPhoto] = useState<string | undefined>();
  
  const qcRequested = order.warehouseItem?.extraServices.find((s: any) => s.type === 'QUALITY_CHECK' && s.status === 'REQUESTED');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WarehouseReceiveInput>({
    resolver: zodResolver(warehouseReceiveSchema),
    defaultValues: {
      photos: [],
      weightGrams: 0,
      lengthCm: 0,
      widthCm: 0,
      heightCm: 0,
      location: '',
    },
  });

  const {
    register: registerQC,
    handleSubmit: handleSubmitQC,
    setValue: setValueQC,
    watch: watchQC,
    formState: { errors: errorsQC },
  } = useForm<QualityCheckResultInput>({
    resolver: zodResolver(qualityCheckResultSchema),
    defaultValues: {
      result: 'OK',
      notes: '',
    },
  });

  const qcResult = watchQC('result');

  const simulatePhotoUpload = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400',
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=400',
      'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=400'
    ];
    const selected = mockPhotos.slice(0, 2 + Math.floor(Math.random() * 2));
    setPhotos(selected);
    setValue('photos', selected, { shouldValidate: true });
  };

  const simulateQcPhotoUpload = () => {
    const mockPhoto = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400';
    setQcPhoto(mockPhoto);
    setValueQC('photo', mockPhoto, { shouldValidate: true });
  };

  const onSubmit = async (data: WarehouseReceiveInput) => {
    setLoading(true);
    try {
      let qcData = undefined;
      if (qcRequested) {
        // Validação manual extra para QC se necessário ou apenas pegar os valores
        qcData = watchQC();
        if (qcData.result === 'PROBLEM' && !qcData.photo) {
          toast.error('Foto de problema é obrigatória para Quality Check');
          setLoading(false);
          return;
        }
      }

      await confirmWarehouseReceipt(order.id, data, qcData);
      toast.success('Recebimento confirmado com sucesso!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao confirmar recebimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Recebimento" size="lg">
      <div className={styles.container}>
        <div className={styles.orderSummary}>
          <p className={styles.productName}>{order.productName}</p>
          <p className={styles.customerName}>Cliente: {order.user.fullName}</p>
          <Badge variant="info">ID: {order.id.slice(0, 8)}</Badge>
        </div>

        <form id="receive-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Fotos do Produto (2-3)</h4>
            <div className={styles.photoGrid}>
              {photos.map((photo, i) => (
                <div key={i} className={styles.photoThumb}>
                  <Image 
                    src={photo} 
                    alt={`Produto ${i + 1}`} 
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
              {photos.length < 3 && (
                <button 
                  type="button" 
                  className={styles.uploadBtn} 
                  onClick={simulatePhotoUpload}
                >
                  <Camera size={24} />
                  <span>Subir Foto</span>
                </button>
              )}
            </div>
            {errors.photos && <p className={styles.error}>{errors.photos.message}</p>}
          </section>

          <div className={styles.grid}>
            <Input
              label="Peso (g)"
              type="number"
              {...register('weightGrams', { valueAsNumber: true })}
              errorMessage={errors.weightGrams?.message}
            />
            <Input
              label="Localização"
              placeholder="Ex: A1-B02"
              {...register('location')}
              errorMessage={errors.location?.message}
            />
          </div>

          <div className={styles.dimensionsGrid}>
            <Input
              label="Comp. (cm)"
              type="number"
              {...register('lengthCm', { valueAsNumber: true })}
              errorMessage={errors.lengthCm?.message}
            />
            <Input
              label="Larg. (cm)"
              type="number"
              {...register('widthCm', { valueAsNumber: true })}
              errorMessage={errors.widthCm?.message}
            />
            <Input
              label="Alt. (cm)"
              type="number"
              {...register('heightCm', { valueAsNumber: true })}
              errorMessage={errors.heightCm?.message}
            />
          </div>

          {qcRequested && (
            <section className={`${styles.section} ${styles.qcSection}`}>
              <h4 className={styles.sectionTitle}>
                <AlertCircle size={18} /> Verificação de Qualidade (QC)
              </h4>
              
              <div className={styles.qcOptions}>
                <label className={styles.qcOption}>
                  <input
                    type="radio"
                    value="OK"
                    {...registerQC('result')}
                  />
                  <div className={styles.qcBox}>
                    <CheckCircle2 size={20} />
                    <span>Produto OK</span>
                  </div>
                </label>
                <label className={styles.qcOption}>
                  <input
                    type="radio"
                    value="PROBLEM"
                    {...registerQC('result')}
                  />
                  <div className={styles.qcBox}>
                    <AlertCircle size={20} />
                    <span>Com Problema</span>
                  </div>
                </label>
              </div>

              <div className={styles.qcDetails}>
                <Input
                  label="Observações do QC"
                  placeholder="Descreva o estado do produto..."
                  {...registerQC('notes')}
                  errorMessage={errorsQC.notes?.message}
                />

                {qcResult === 'PROBLEM' && (
                  <div className={styles.qcPhotoUpload}>
                    <p className={styles.label}>Foto do Problema (Obrigatória)</p>
                    {qcPhoto ? (
                      <div className={styles.photoThumb}>
                        <Image 
                          src={qcPhoto} 
                          alt="Problema" 
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={simulateQcPhotoUpload}
                      >
                        Subir Foto do Dano
                      </Button>
                    )}
                    {errorsQC.photo && <p className={styles.error}>{errorsQC.photo.message}</p>}
                  </div>
                )}
              </div>
            </section>
          )}

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Confirmar Recebimento
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
