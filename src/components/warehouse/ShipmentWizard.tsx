'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarehouseItem, Address, ShippingMethod, DeclaredValueType } from '@prisma/client';
import { X, ChevronLeft, ChevronRight, Package, Truck, Shield, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { shipmentCreateSchema, type ShipmentCreateInput } from '@/lib/validators/shipment.schema';
import { calculateShippingCost, calculateInsuranceCost } from '@/lib/utils/shipping-calculator';
import { createShipment } from '@/lib/actions/warehouse';
import styles from './ShipmentWizard.module.css';

interface ShipmentWizardProps {
  items: WarehouseItem[];
  addresses: Address[];
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  'Itens',
  'Frete',
  'Seguro',
  'Endereço',
  'Confirmar'
];

export const ShipmentWizard: React.FC<ShipmentWizardProps> = ({ 
  items, 
  addresses, 
  onClose, 
  onSuccess 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ShipmentCreateInput>({
    resolver: zodResolver(shipmentCreateSchema),
    defaultValues: {
      warehouseItemIds: items.map(i => i.id),
      shippingMethod: 'EMS',
      addressId: addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '',
      hasInsurance: false,
      declaredValueType: 'REAL',
      disclaimerAccepted: false,
    }
  });

  const selectedMethod = watch('shippingMethod');
  const hasInsurance = watch('hasInsurance');
  const declaredValueType = watch('declaredValueType');
  const manualValue = watch('manualDeclaredValueBrl');
  const selectedAddressId = watch('addressId');

  const totalWeight = useMemo(() => {
    return items.reduce((acc, item) => acc + item.weightGrams, 0);
  }, [items]);

  const shippingCost = useMemo(() => {
    try {
      return calculateShippingCost(selectedMethod as ShippingMethod, totalWeight);
    } catch {
      return 0;
    }
  }, [selectedMethod, totalWeight]);

  const declaredValue = useMemo(() => {
    if (declaredValueType === 'REAL') {
      // Mock de valor real - na prática o backend calcula com base no Order
      // Para o frontend, vamos assumir um valor total mock ou soma se tivéssemos os dados
      return 500; // Mock
    }
    return manualValue || 0;
  }, [declaredValueType, manualValue]);

  const insuranceCost = hasInsurance ? calculateInsuranceCost(declaredValue) : 0;
  const totalCost = shippingCost + insuranceCost;

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: ShipmentCreateInput) => {
    setIsSubmitting(true);
    setError(null);
    
    const result = await createShipment(data);
    
    if ('error' in result && result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      onSuccess();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Resumo Itens
        return (
          <div className={styles.itemList}>
            <h3 className={styles.stepTitle}>Itens Selecionados</h3>
            {items.map(item => (
              <div key={item.id} className={styles.itemRow}>
                <img 
                  src={(item.photos as string[])[0] || '/placeholder-package.png'} 
                  alt={item.name} 
                  className={styles.itemThumb} 
                />
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemWeight}>{item.weightGrams}g</div>
              </div>
            ))}
            <div className={styles.summaryBox}>
              <span>Peso Total Estimado:</span>
              <strong>{totalWeight}g</strong>
            </div>
          </div>
        );

      case 1: // Método de Frete
        return (
          <div className={styles.methodsGrid}>
            {(['SAL', 'EMS', 'DHL', 'FEDEX'] as const).map(method => {
              const cost = calculateShippingCost(method, totalWeight);
              const isSelected = selectedMethod === method;
              return (
                <div 
                  key={method} 
                  className={`${styles.methodCard} ${isSelected ? styles.selectedMethod : ''}`}
                  onClick={() => setValue('shippingMethod', method)}
                >
                  <div className={styles.methodName}>{method}</div>
                  <div className={styles.methodPrice}>R$ {cost.toFixed(2)}</div>
                  <div className={styles.methodTime}>
                    {method === 'SAL' && '~45 dias úteis'}
                    {method === 'EMS' && '~15 dias úteis'}
                    {method === 'DHL' && '~5 dias úteis'}
                    {method === 'FEDEX' && '~5 dias úteis'}
                  </div>
                  {isSelected && <CheckCircle2 className={styles.selectedIcon} />}
                </div>
              );
            })}
          </div>
        );

      case 2: // Seguro + Declaração
        return (
          <div className={styles.declarationSection}>
            <div className={styles.insuranceSection}>
              <div className={styles.checkboxContainer}>
                <input 
                  type="checkbox" 
                  id="hasInsurance" 
                  {...register('hasInsurance')}
                  disabled={declaredValueType === 'MANUAL'}
                />
                <label htmlFor="hasInsurance">Adicionar Seguro de Envio (2% do valor declarado)</label>
              </div>
              <p className={styles.hint}>Custo: R$ {insuranceCost.toFixed(2)}</p>
              {declaredValueType === 'MANUAL' && (
                <p className={styles.warning}>Seguro não disponível para declaração manual.</p>
              )}
            </div>

            <h4 className={styles.subTitle}>Declaração Aduaneira</h4>
            <div 
              className={`${styles.declarationOption} ${declaredValueType === 'REAL' ? styles.selectedOption : ''}`}
              onClick={() => {
                setValue('declaredValueType', 'REAL');
                setValue('manualDeclaredValueBrl', undefined);
              }}
            >
              <strong>Valor Real (Recomendado)</strong>
              <p>Os valores serão baseados nos comprovantes de compra dos itens.</p>
            </div>

            <div 
              className={`${styles.declarationOption} ${declaredValueType === 'MANUAL' ? styles.selectedOption : ''}`}
              onClick={() => setValue('declaredValueType', 'MANUAL')}
            >
              <strong>Valor Manual (Personalizado)</strong>
              <p>Você assume a responsabilidade total em caso de fiscalização ou perda.</p>
              {declaredValueType === 'MANUAL' && (
                <input 
                  type="number" 
                  placeholder="Valor em BRL" 
                  className={styles.manualInput}
                  {...register('manualDeclaredValueBrl', { valueAsNumber: true })}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>

            {declaredValueType === 'MANUAL' && (
              <div className={styles.disclaimerBox}>
                <p><strong>ATENÇÃO:</strong> Ao declarar um valor diferente do real, você isenta a Nipponbox de qualquer responsabilidade sobre tributação, apreensão ou seguro abaixo do valor real.</p>
                <div className={styles.checkboxContainer}>
                  <input type="checkbox" id="disclaimer" {...register('disclaimerAccepted')} />
                  <label htmlFor="disclaimer">Li e aceito os termos de responsabilidade</label>
                </div>
                {errors.disclaimerAccepted && <p className={styles.errorText}>{errors.disclaimerAccepted.message}</p>}
              </div>
            )}
          </div>
        );

      case 3: // Endereço
        return (
          <div className={styles.addressList}>
            <h3 className={styles.stepTitle}>Endereço de Entrega</h3>
            {addresses.map(addr => (
              <div 
                key={addr.id} 
                className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selectedAddress : ''}`}
                onClick={() => setValue('addressId', addr.id)}
              >
                <div>
                  <strong>{addr.label}</strong>
                  <p>{addr.street}, {addr.number} - {addr.city}/{addr.state}</p>
                </div>
                {selectedAddressId === addr.id && <CheckCircle2 />}
              </div>
            ))}
            {addresses.length === 0 && (
              <p className={styles.errorText}>Nenhum endereço cadastrado. Por favor, cadastre um endereço em seu perfil.</p>
            )}
          </div>
        );

      case 4: // Resumo Final
        return (
          <div className={styles.finalSummary}>
            <h3 className={styles.stepTitle}>Resumo do Pedido de Envio</h3>
            <div className={styles.summaryLine}>
              <span>Método de Frete:</span>
              <strong>{selectedMethod}</strong>
            </div>
            <div className={styles.summaryLine}>
              <span>Itens:</span>
              <strong>{items.length} itens ({totalWeight}g)</strong>
            </div>
            <div className={styles.summaryLine}>
              <span>Custo de Frete:</span>
              <strong>R$ {shippingCost.toFixed(2)}</strong>
            </div>
            <div className={styles.summaryLine}>
              <span>Seguro:</span>
              <strong>{hasInsurance ? `R$ ${insuranceCost.toFixed(2)}` : 'Não selecionado'}</strong>
            </div>
            <div className={styles.totalLine}>
              <span>TOTAL A PAGAR:</span>
              <strong>R$ {totalCost.toFixed(2)}</strong>
            </div>
            {error && <div className={styles.errorBox}>{error}</div>}
            <p className={styles.hint}>O valor será debitado da sua carteira Nipponbox.</p>
          </div>
        );

      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 2 && declaredValueType === 'MANUAL' && !watch('disclaimerAccepted')) return true;
    if (currentStep === 3 && !selectedAddressId) return true;
    return false;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Novo Envio</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div 
              key={step} 
              className={`${styles.step} ${currentStep === index ? styles.activeStep : ''}`}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>

        <div className={styles.content}>
          {renderStepContent()}
        </div>

        <div className={styles.footer}>
          {currentStep > 0 && (
            <Button variant="secondary" onClick={prevStep} disabled={isSubmitting}>
              <ChevronLeft size={18} /> Voltar
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} disabled={isNextDisabled()}>
              Próximo <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} variant="primary">
              Confirmar e Pagar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
