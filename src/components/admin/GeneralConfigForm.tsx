'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminConfigSchema, AdminConfigInput } from '@/lib/schemas/admin-config.schema';
import { updateSystemConfig } from '@/lib/actions/admin-config';
import { useToast } from '@/components/ui/Toast/Toast';
import { Save, Plus, Trash2, Globe, ShieldAlert } from 'lucide-react';
import styles from './GeneralConfigForm.module.css';

interface Props {
  initialData: any;
}

export function GeneralConfigForm({ initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const { register, control, handleSubmit, formState: { errors } } = useForm<AdminConfigInput>({
    resolver: zodResolver(adminConfigSchema),
    defaultValues: {
      ...initialData,
      serviceFeePercent: Number(initialData.serviceFeePercent),
      fixedFeeBrl: Number(initialData.fixedFeeBrl),
      jpyExchangeRate: Number(initialData.jpyExchangeRate),
      storageFeePerDay: Number(initialData.storageFeePerDay),
    }
  });

  const { fields: platforms, append: appendPlatform, remove: removePlatform } = useFieldArray({
    control,
    name: "allowedPlatforms" as any
  });

  const { fields: prohibited, append: appendProhibited, remove: removeProhibited } = useFieldArray({
    control,
    name: "prohibitedProducts" as any
  });

  const onSubmit = async (data: AdminConfigInput) => {
    setLoading(true);
    try {
      await updateSystemConfig(data);
      addToast({ type: 'success', message: 'Configurações atualizadas com sucesso!' });
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Erro ao atualizar configurações' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Taxas e Operação</h3>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Taxa de Serviço (%)</label>
            <input type="number" step="0.01" {...register('serviceFeePercent', { valueAsNumber: true })} />
            {errors.serviceFeePercent && <span className={styles.error}>{errors.serviceFeePercent.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Taxa Fixa (R$)</label>
            <input type="number" step="0.01" {...register('fixedFeeBrl', { valueAsNumber: true })} />
            {errors.fixedFeeBrl && <span className={styles.error}>{errors.fixedFeeBrl.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Cotação JPY (¥1 = R$)</label>
            <input type="number" step="0.0001" {...register('jpyExchangeRate', { valueAsNumber: true })} />
            {errors.jpyExchangeRate && <span className={styles.error}>{errors.jpyExchangeRate.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Armazenamento Grátis (Dias)</label>
            <input type="number" {...register('freeStorageDays', { valueAsNumber: true })} />
            {errors.freeStorageDays && <span className={styles.error}>{errors.freeStorageDays.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Cobrança p/ Dia Excedente (R$)</label>
            <input type="number" step="0.01" {...register('storageFeePerDay', { valueAsNumber: true })} />
            {errors.storageFeePerDay && <span className={styles.error}>{errors.storageFeePerDay.message}</span>}
          </div>
        </div>
      </div>

      <div className={styles.twoCols}>
        <div className={styles.section}>
          <div className={styles.headerWithAction}>
            <h3 className={styles.sectionTitle}><Globe size={18} /> Plataformas Aceitas</h3>
            <button type="button" className={styles.addBtn} onClick={() => appendPlatform("https://")}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div className={styles.list}>
            {platforms.map((field, index) => (
              <div key={field.id} className={styles.listItem}>
                <input {...register(`allowedPlatforms.${index}` as any)} placeholder="https://..." />
                <button type="button" className={styles.removeBtn} onClick={() => removePlatform(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {errors.allowedPlatforms && <span className={styles.error}>{errors.allowedPlatforms.message}</span>}
        </div>

        <div className={styles.section}>
          <div className={styles.headerWithAction}>
            <h3 className={styles.sectionTitle}><ShieldAlert size={18} /> Produtos Proibidos</h3>
            <button type="button" className={styles.addBtn} onClick={() => appendProhibited("")}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div className={styles.list}>
            {prohibited.map((field, index) => (
              <div key={field.id} className={styles.listItem}>
                <input {...register(`prohibitedProducts.${index}` as any)} placeholder="Nome do produto..." />
                <button type="button" className={styles.removeBtn} onClick={() => removeProhibited(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        <Save size={20} />
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}
