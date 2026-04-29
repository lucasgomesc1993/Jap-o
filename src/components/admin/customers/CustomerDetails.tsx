'use client';

import { useState } from 'react';
import { formatCurrencyBRL, formatDate } from '@/lib/utils/formatters';
import { Button, Badge, Input } from '@/components/ui';
import { toast } from '@/stores/toast.store';
import { executeManualTransaction, toggleUserBlock } from '@/lib/actions/admin-customers';
import styles from './CustomerDetails.module.css';

interface CustomerDetailsProps {
  customer: any;
  adminId: string;
}

export function CustomerDetails({ customer: initialCustomer, adminId }: CustomerDetailsProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [activeTab, setActiveTab] = useState<'orders' | 'shipments' | 'tickets'>('orders');
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'MANUAL_CREDIT' | 'MANUAL_DEBIT'>('MANUAL_CREDIT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const maskCpf = (cpf: string) => {
    if (!cpf) return '';
    // Formato pedido: ###.***.**#-##
    // Mas o CPF tem 11 dígitos. Vamos tentar chegar perto:
    // 123.456.789-01 -> 123.***.**9-01
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return `${clean.substring(0, 3)}.***.**${clean.substring(8, 9)}-${clean.substring(9)}`;
  };

  const handleToggleBlock = async () => {
    try {
      setLoading(true);
      const updated = await toggleUserBlock(adminId, customer.id);
      setCustomer({ ...customer, blocked: updated.blocked });
      toast.success(updated.blocked ? 'Usuário bloqueado!' : 'Usuário desbloqueado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await executeManualTransaction(adminId, customer.id, {
        type: transactionType,
        amount: Number(amount),
        reason
      });
      
      toast.success('Transação realizada com sucesso!');
      setAmount('');
      setReason('');
      
      // Recarregar dados simplificado (apenas para atualizar saldo no mock local)
      const multiplier = transactionType === 'MANUAL_CREDIT' ? 1 : -1;
      const newBalance = Number(customer.wallet.balance) + (Number(amount) * multiplier);
      setCustomer({
        ...customer,
        wallet: {
          ...customer.wallet,
          balance: newBalance
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.profileHeader}>
        <div className={styles.userInfo}>
          <h1>{customer.fullName}</h1>
          <div className={styles.userMeta}>
            <span><strong>Email:</strong> {customer.email}</span>
            <span><strong>CPF:</strong> {maskCpf(customer.cpf)}</span>
            <span><strong>Telefone:</strong> {customer.phone || 'Não informado'}</span>
            <span><strong>Cliente desde:</strong> {formatDate(customer.createdAt)}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button 
            variant={customer.blocked ? 'primary' : 'danger'}
            onClick={handleToggleBlock}
            loading={loading}
          >
            {customer.blocked ? 'Desbloquear Conta' : 'Bloquear Conta'}
          </Button>
        </div>
      </header>

      <div className={styles.grid}>
        <main className={styles.mainContent}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Pedidos ({customer.orders?.length || 0})
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'shipments' ? styles.active : ''}`}
              onClick={() => setActiveTab('shipments')}
            >
              Envios ({customer.shipments?.length || 0})
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'tickets' ? styles.active : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Chamados ({customer.tickets?.length || 0})
            </button>
          </div>

          <div className={styles.card}>
            {activeTab === 'orders' && (
              <div className={styles.historyList}>
                {customer.orders?.length === 0 ? (
                  <p className={styles.empty}>Nenhum pedido encontrado.</p>
                ) : (
                  customer.orders.map((order: any) => (
                    <div key={order.id} className={styles.historyItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{order.productName}</span>
                        <Badge variant="info">{order.status}</Badge>
                      </div>
                      <div className={styles.itemDate}>
                        {formatDate(order.createdAt)} • {formatCurrencyBRL(Number(order.totalBrl))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'shipments' && (
              <div className={styles.historyList}>
                {customer.shipments?.length === 0 ? (
                  <p className={styles.empty}>Nenhum envio encontrado.</p>
                ) : (
                  customer.shipments.map((shipment: any) => (
                    <div key={shipment.id} className={styles.historyItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>Envio #{shipment.id.substring(0, 8)}</span>
                        <Badge variant="info">{shipment.status}</Badge>
                      </div>
                      <div className={styles.itemDate}>
                        {formatDate(shipment.createdAt)} • {shipment.shippingMethod}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className={styles.historyList}>
                {customer.tickets?.length === 0 ? (
                  <p className={styles.empty}>Nenhum chamado encontrado.</p>
                ) : (
                  customer.tickets.map((ticket: any) => (
                    <div key={ticket.id} className={styles.historyItem}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{ticket.subject}</span>
                        <Badge variant={ticket.status === 'OPEN' ? 'warning' : 'success'}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className={styles.itemDate}>
                        {formatDate(ticket.createdAt)} • {ticket.type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3>Carteira</h3>
            <div className={styles.balance}>
              {formatCurrencyBRL(Number(customer.wallet?.balance || 0))}
            </div>
            
            <form className={styles.form} onSubmit={handleTransaction}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Nova Transação Manual
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <Button 
                    type="button"
                    size="sm"
                    variant={transactionType === 'MANUAL_CREDIT' ? 'primary' : 'secondary'}
                    onClick={() => setTransactionType('MANUAL_CREDIT')}
                    style={{ flex: 1 }}
                  >
                    Crédito
                  </Button>
                  <Button 
                    type="button"
                    size="sm"
                    variant={transactionType === 'MANUAL_DEBIT' ? 'danger' : 'secondary'}
                    onClick={() => setTransactionType('MANUAL_DEBIT')}
                    style={{ flex: 1 }}
                  >
                    Débito
                  </Button>
                </div>
              </div>

              <Input 
                type="number" 
                placeholder="Valor (R$)" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
              
              <Input 
                placeholder="Motivo da transação" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} style={{ width: '100%' }}>
                Executar {transactionType === 'MANUAL_CREDIT' ? 'Crédito' : 'Débito'}
              </Button>
            </form>
          </div>

          <div className={styles.card}>
            <h3>Endereços ({customer.addresses?.length || 0})</h3>
            <div className={styles.historyList}>
              {customer.addresses?.map((addr: any) => (
                <div key={addr.id} className={styles.historyItem} style={{ fontSize: '12px' }}>
                  <strong>{addr.label}</strong> {addr.isDefault && <Badge variant="success" size="sm">Padrão</Badge>}
                  <br />
                  {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}
                  <br />
                  {addr.neighborhood} - {addr.city}/{addr.state}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
