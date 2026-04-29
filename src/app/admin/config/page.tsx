import React from 'react';
import { getSystemConfig, getLegalDocument } from '@/lib/actions/admin-config';
import { ConfigTabs } from '@/components/admin/ConfigTabs';
import { GeneralConfigForm } from '@/components/admin/GeneralConfigForm';
import { ShippingRatesTable } from '@/components/admin/ShippingRatesTable';
import { LegalDocsForm } from '@/components/admin/LegalDocsForm';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { 
  Settings, 
  Truck, 
  FileText, 
  ClipboardList 
} from 'lucide-react';
import styles from './page.module.css';

export default async function ConfigPage() {
  const config = await getSystemConfig();
  const legalDoc = await getLegalDocument();

  const tabs = [
    { id: 'general', label: 'Geral', icon: <Settings size={20} /> },
    { id: 'shipping', label: 'Fretes', icon: <Truck size={20} /> },
    { id: 'legal', label: 'Termos', icon: <FileText size={20} /> },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList size={20} /> },
  ];

  // Serializar dados decimais para o client component
  const serializedConfig = {
    ...config,
    serviceFeePercent: Number(config.serviceFeePercent),
    fixedFeeBrl: Number(config.fixedFeeBrl),
    storageFeePerDay: Number(config.storageFeePerDay),
    jpyExchangeRate: Number(config.jpyExchangeRate),
  };

  const serializedLegalDoc = legalDoc ? {
    ...legalDoc,
    createdAt: legalDoc.createdAt.toISOString()
  } : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configurações do Sistema</h1>
        <p className={styles.subtitle}>Gerencie taxas, preços, termos legais e monitore ações administrativas.</p>
      </header>

      <ConfigTabs tabs={tabs}>
        {(activeTab) => {
          switch (activeTab) {
            case 'general':
              return <GeneralConfigForm initialData={serializedConfig} />;
            case 'shipping':
              return <ShippingRatesTable initialRates={config.shippingRates} allConfig={serializedConfig} />;
            case 'legal':
              return <LegalDocsForm initialDoc={serializedLegalDoc} />;
            case 'audit':
              return <AuditLogViewer />;
            default:
              return null;
          }
        }}
      </ConfigTabs>
    </div>
  );
}
