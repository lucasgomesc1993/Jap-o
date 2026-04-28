'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Carteira</h1>
        <p className={styles.subtitle}>Gerencie seu saldo e veja seu histórico financeiro.</p>
      </header>

      <div className={styles.grid}>
        {/* Balance Card */}
        <Card className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <span className={styles.label}>Saldo Disponível</span>
            <div className={styles.amount}>{formatCurrency(balance)}</div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
            <Plus size={16} /> Adicionar Créditos
          </Button>
        </Card>

        {/* Transactions List */}
        <Card className={styles.transactionsCard}>
          <div className={styles.cardHeader}>
            <h3>Extrato Recente</h3>
          </div>
          <div className={styles.transactionsList}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={40} strokeWidth={1} />
                <p>Nenhuma transação encontrada.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className={styles.transactionItem}>
                  <div className={styles.txIcon}>
                    {tx.type === 'CREDIT' ? (
                      <ArrowUpRight size={20} className={styles.creditIcon} />
                    ) : (
                      <ArrowDownLeft size={20} className={styles.debitIcon} />
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
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Add Credits Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPixData(null);
        }}
        title="Adicionar Créditos"
      >
        {!pixData ? (
          <div className={styles.modalContent}>
            <p>Insira o valor que deseja adicionar à sua carteira (Mínimo R$ 10,00).</p>
            <Input
              label="Valor (R$)"
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              placeholder="0,00"
            />
            <Button 
              onClick={handleAddCredits} 
              isLoading={isLoading} 
              fullWidth
            >
              Gerar Pix
            </Button>
          </div>
        ) : (
          <div className={styles.pixContent}>
            <div className={styles.qrCodeContainer}>
              <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" />
            </div>
            <p className={styles.pixLabel}>Escaneie o código acima ou copie o código abaixo:</p>
            <div className={styles.copyGroup}>
              <code className={styles.pixCode}>{pixData.qrCode}</code>
              <Button variant="ghost" onClick={copyToClipboard} className={styles.copyBtn}>
                {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
              </Button>
            </div>
            <div className={styles.pixFooter}>
              <Badge variant="warning">Aguardando Pagamento</Badge>
              <p>O saldo será creditado automaticamente após a confirmação.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
