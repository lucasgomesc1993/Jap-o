'use client';

import React, { useState } from 'react';
import { updateLegalDocument } from '@/lib/actions/admin-config';
import { useToast } from '@/components/ui/Toast/Toast';
import { Save, History, FileText } from 'lucide-react';
import styles from './LegalDocsForm.module.css';

interface Props {
  initialDoc: any;
}

export function LegalDocsForm({ initialDoc }: Props) {
  const [content, setContent] = useState(initialDoc?.content || '');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (content.length < 10) {
      addToast({ type: 'error', message: 'O conteúdo deve ter pelo menos 10 caracteres' });
      return;
    }

    setLoading(true);
    try {
      await updateLegalDocument(content);
      addToast({ type: 'success', message: 'Termos atualizados e nova versão criada!' });
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Erro ao salvar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <FileText size={24} />
          <div>
            <h3>Termos de Responsabilidade</h3>
            <p>Versão atual: <strong>{initialDoc?.version || 1}</strong> (Desde {initialDoc ? new Date(initialDoc.createdAt).toLocaleDateString() : 'N/A'})</p>
          </div>
        </div>
      </div>

      <div className={styles.editor}>
        <label>Conteúdo do Documento (Markdown suportado no futuro)</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva os termos aqui..."
          rows={15}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.tip}>
          <History size={16} />
          <span>Ao salvar, uma nova versão será registrada. Os aceites anteriores permanecerão vinculados à versão antiga.</span>
        </div>
        <button 
          className={styles.saveBtn} 
          onClick={handleSave}
          disabled={loading}
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Publicar Nova Versão'}
        </button>
      </div>
    </div>
  );
}
