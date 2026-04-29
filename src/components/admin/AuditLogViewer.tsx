'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/actions/admin-config';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react';
import styles from './AuditLogViewer.module.css';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalEntries: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const data = await getAuditLogs(page);
      setLogs(data.logs);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalEntries: data.totalEntries
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Histórico de Auditoria</h3>
        <span className={styles.count}>{pagination.totalEntries} registros encontrados</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Administrador</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>ID Entidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loading}>Carregando logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>Nenhum log encontrado.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{format(new Date(log.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</td>
                  <td>
                    <div className={styles.adminInfo}>
                      <strong>{log.admin.fullName}</strong>
                      <span>{log.admin.email}</span>
                    </div>
                  </td>
                  <td><span className={styles.actionBadge}>{log.action}</span></td>
                  <td>{log.entityType}</td>
                  <td className={styles.mono}>{log.entityId.slice(0, 8)}...</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedLog(log)}>
                      <Eye size={16} /> Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button 
          disabled={pagination.currentPage === 1 || loading} 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          <ChevronLeft size={20} />
        </button>
        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
        <button 
          disabled={pagination.currentPage === pagination.totalPages || loading}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {selectedLog && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4>Detalhes da Ação: {selectedLog.action}</h4>
              <button onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
              <div className={styles.meta}>
                <p><strong>IP:</strong> {selectedLog.ipAddress || 'Não registrado'}</p>
                <p><strong>Entidade:</strong> {selectedLog.entityType} ({selectedLog.entityId})</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
