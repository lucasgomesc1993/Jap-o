'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ShippingMethod } from '@prisma/client';
import { updateSystemConfig } from '@/lib/actions/admin-config';
import { useToast } from '@/components/ui/Toast/Toast';
import { Plus, Trash2, Save, Truck } from 'lucide-react';
import styles from './ShippingRatesTable.module.css';

interface Props {
  initialRates: any;
  allConfig: any;
}

export function ShippingRatesTable({ initialRates, allConfig }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState<ShippingMethod>(ShippingMethod.SAL);
  const { addToast } = useToast();

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      shippingRates: initialRates
    }
  });

  const methods: ShippingMethod[] = [
    ShippingMethod.SAL,
    ShippingMethod.EMS,
    ShippingMethod.DHL,
    ShippingMethod.FEDEX
  ];

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await updateSystemConfig({
        ...allConfig,
        serviceFeePercent: Number(allConfig.serviceFeePercent),
        fixedFeeBrl: Number(allConfig.fixedFeeBrl),
        jpyExchangeRate: Number(allConfig.jpyExchangeRate),
        storageFeePerDay: Number(allConfig.storageFeePerDay),
        shippingRates: data.shippingRates
      });
      addToast({ type: 'success', message: 'Tabela de frete atualizada!' });
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Erro ao atualizar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {methods.map(method => (
          <button 
            key={method}
            className={`${styles.methodBtn} ${activeMethod === method ? styles.active : ''}`}
            onClick={() => setActiveMethod(method)}
          >
            <Truck size={18} />
            {method}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.header}>
          <h3>Faixas de Peso - {activeMethod}</h3>
          <p>Defina o preço base e o custo por grama adicional para cada faixa de peso.</p>
        </div>

        <div className={styles.rangesList}>
          {methods.map(method => (
            <div key={method} style={{ display: activeMethod === method ? 'block' : 'none' }}>
              <MethodRanges 
                method={method} 
                control={control} 
                register={register} 
              />
            </div>
          ))}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar Tabela'}
        </button>
      </form>
    </div>
  );
}

function MethodRanges({ method, control, register }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `shippingRates.${method}`
  });

  return (
    <div className={styles.rangesContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Min (g)</th>
            <th>Max (g)</th>
            <th>Preço Base (¥)</th>
            <th>¥ / grama</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td><input type="number" {...register(`shippingRates.${method}.${index}.min`, { valueAsNumber: true })} /></td>
              <td><input type="number" {...register(`shippingRates.${method}.${index}.max`, { valueAsNumber: true })} /></td>
              <td><input type="number" step="0.01" {...register(`shippingRates.${method}.${index}.basePrice`, { valueAsNumber: true })} /></td>
              <td><input type="number" step="0.001" {...register(`shippingRates.${method}.${index}.pricePerGram`, { valueAsNumber: true })} /></td>
              <td>
                <button type="button" className={styles.removeBtn} onClick={() => remove(index)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button 
        type="button" 
        className={styles.addBtn}
        onClick={() => append({ min: 0, max: 1000, basePrice: 0, pricePerGram: 0 })}
      >
        <Plus size={16} /> Adicionar Faixa
      </button>
    </div>
  );
}
