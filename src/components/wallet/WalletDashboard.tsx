'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Badge, Modal, useToast } from '@/components/ui';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Copy, Check, Clock } from 'lucide-react';
import styles from './WalletDashboard.module.css';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletDashboardProps {
  balance: number;
  transactions: Transaction[];
  userId: string;
}

export function WalletDashboard({ balance, transactions, userId }: WalletDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string, qrCodeBase64: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [visibleCount, setVisibleCount] = useState(10);
  
  const { addToast } = useToast();

  const handleAddCredits = async () => {
    const value = parseFloat(amountToAdd);
    if (isNaN(value) || value < 10) {
      addToast({
        title: 'Valor Inválido',
        message: 'O valor mínimo para recarga é R$ 10,00',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          description: 'Recarga de Carteira NipponBox',
          referenceId: `WALLET_${userId}`,
        }),
      });

      if (!response.ok) throw new Error('Falha ao gerar Pix');

      const data = await response.json();
      setPixData({
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
      });
    } catch (error) {
      addToast({
        title: 'Erro',
        message: 'Não foi possível gerar o Pix no momento.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ title: 'Copiado', message: 'Código Pix copiado para a área de transferência', type: 'info' });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Carteira</h1>
        <p className={styles.subtitle}>Gerencie seu capital e controle o fluxo financeiro de suas importações em tempo real.</p>
      </header>

      <div className={styles.grid}>
        {/* Balance Card - ATM Style */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <span className={styles.label}>
              <span className={styles.labelIndex}>01</span>
              <span>{` // Saldo Disponível`}</span>
            </span>
            <div className={styles.amount}>{formatCurrency(balance)}</div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
            ADICIONAR CRÉDITOS
          </Button>
        </div>

        {/* Transactions List */}
        <div className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <h3>02 // Extrato Recente</h3>
            <div className={styles.filters}>
              <button 
                className={`${styles.filterBtn} ${filterType === 'ALL' ? styles.active : ''}`}
                onClick={() => setFilterType('ALL')}
              >TODOS</button>
              <button 
                className={`${styles.filterBtn} ${filterType === 'CREDIT' ? styles.active : ''}`}
                onClick={() => setFilterType('CREDIT')}
              >CRÉDITO</button>
              <button 
                className={`${styles.filterBtn} ${filterType === 'DEBIT' ? styles.active : ''}`}
                onClick={() => setFilterType('DEBIT')}
              >DÉBITO</button>
            </div>
          </div>
          <div className={styles.transactionsList}>
            {visibleTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={40} strokeWidth={1} />
                <p>Nenhuma transação encontrada com estes filtros.</p>
              </div>
            ) : (
              <>
                {visibleTransactions.map((tx) => (
                  <div key={tx.id} className={styles.transactionItem}>
                    <div className={styles.txIcon}>
                      {tx.type === 'CREDIT' ? (
                        <ArrowDownLeft size={20} className={styles.creditIcon} strokeWidth={1.5} />
                      ) : (
                        <ArrowUpRight size={20} className={styles.debitIcon} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className={styles.txDetails}>
                      <span className={styles.txDesc}>{tx.description}</span>
                      <span className={styles.txDate}>{formatDate(tx.createdAt)}</span>
                    </div>
                    <div className={`${styles.txAmount} ${tx.type === 'CREDIT' ? styles.credit : styles.debit}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                    </div>
                  </div>
                ))}
                
                {hasMore && (
                  <div className={styles.pagination}>
                    <button 
                      className={styles.loadMoreBtn}
                      onClick={() => setVisibleCount(prev => prev + 10)}
                    >
                      CARREGAR MAIS TRANSAÇÕES
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Credits Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPixData(null);
        }}
        title="ADICIONAR CRÉDITOS"
      >
        {!pixData ? (
          <div className={styles.modalContent}>
            <p className={styles.subtitle}>Insira o valor que deseja depositar em BRL (Mínimo R$ 10,00).</p>
            <Input
              label="VALOR (R$)"
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              placeholder="0,00"
            />
            <Button 
              onClick={handleAddCredits} 
              loading={isLoading} 
              fullWidth
              className={styles.addButton}
              style={{ marginTop: '24px' }}
            >
              GERAR PIX
            </Button>
          </div>
        ) : (
          <div className={styles.pixContent}>
            <div className={styles.qrCodeContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" />
            </div>
            <p className={styles.pixLabel}>Escaneie o QR Code ou copie a chave Pix Copia e Cola:</p>
            <div className={styles.copyGroup}>
              <code className={styles.pixCode}>{pixData.qrCode}</code>
              <Button variant="ghost" onClick={copyToClipboard} className={styles.copyBtn}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <div className={styles.pixFooter}>
              <Badge variant="warning">AGUARDANDO PAGAMENTO</Badge>
              <p>O saldo será creditado automaticamente em sua carteira.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
