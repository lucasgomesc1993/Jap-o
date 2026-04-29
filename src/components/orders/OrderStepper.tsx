'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight, ArrowLeft, Check, JapaneseYen, ShoppingBag, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { Button, Input, Card, Badge, useToast } from '@/components/ui';
import { type OrderCreateInput } from '@/lib/validators/order-create.schema';
import { createOrder } from '@/lib/actions/orders';
import styles from './OrderStepper.module.css';

interface OrderStepperProps {
  initialExchangeRate: number;
}

export function OrderStepper({ initialExchangeRate }: OrderStepperProps) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<Partial<OrderCreateInput> | null>(null);
  const [formData, setFormData] = useState<OrderCreateInput>({
    productUrl: '',
    productName: '',
    productImage: '',
    priceJpy: 0,
    quantity: 1,
    variation: '',
    notes: '',
  });
  
  const { addToast } = useToast();
  const router = useRouter();

  // Configurações de taxas (idealmente viriam do banco/config)
  const serviceFeePercent = 0.10; // 10%
  const fixedFeeBrl = 20.00; // R$ 20 por pedido

  const handleFetchProduct = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao buscar produto');
      }

      const data = await response.json();
      setScrapedData(data);
      setFormData({
        ...formData,
        productUrl: url,
        productName: data.name,
        productImage: data.image,
        priceJpy: data.priceJpy,
      });
      setStep(2);
    } catch (error) {
      addToast({
        title: 'Falha no Scraping',
        message: error instanceof Error ? error.message : 'Não foi possível extrair os dados. Tente o preenchimento manual.',
        type: 'warning',
      });
      // Fallback manual: permite ir para o próximo passo mesmo sem scraping
      setFormData({ ...formData, productUrl: url });
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCosts = () => {
    const productBrl = formData.priceJpy * initialExchangeRate;
    const serviceFee = productBrl * serviceFeePercent;
    const totalBrl = (productBrl + serviceFee) * formData.quantity + fixedFeeBrl;
    
    return {
      productBrl: productBrl * formData.quantity,
      serviceFee: serviceFee * formData.quantity,
      fixedFee: fixedFeeBrl,
      totalBrl,
    };
  };

  const costs = calculateCosts();

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      await createOrder(formData);
      addToast({
        title: 'Pedido Criado',
        message: 'Seu pedido foi registrado. Aguardando confirmação de pagamento.',
        type: 'success',
      });
      router.push('/dashboard/orders');
    } catch (error) {
      addToast({
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Falha ao criar pedido.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Editorial Header */}
      <div className={styles.header}>
        <span className={styles.stepIndicator}>Step 0{step}</span>
        <h1 className={styles.title}>
          {step === 1 && 'Coloque o Link'}
          {step === 2 && 'Confirme os Dados'}
          {step === 3 && 'Resumo de Custos'}
          {step === 4 && 'Pagamento'}
        </h1>
      </div>

      {/* Progress Line */}
      <div className={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`${styles.progressItem} ${s <= step ? styles.active : ''}`}
            onClick={() => s < step && setStep(s)}
          >
            <span className={styles.progressNumber}>0{s}</span>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {/* STEP 1: URL INPUT */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <p className={styles.description}>
              Insira o link do produto da Amazon JP, Mercari, Rakuten ou Yahoo Auctions. 
              Nós buscaremos os detalhes automaticamente para você.
            </p>
            <div className={styles.inputGroup}>
              <Input
                label="URL do Produto"
                placeholder="https://www.amazon.co.jp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                icon={<Search size={18} />}
              />
              <Button 
                onClick={handleFetchProduct} 
                loading={isLoading}
                disabled={!url || isLoading}
                className={styles.mainButton}
              >
                Buscar Produto <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & EDIT */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <Card className={styles.previewCard}>
              <div className={styles.previewLayout}>
                {formData.productImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={formData.productImage} alt={formData.productName} className={styles.productImage} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <ShoppingBag size={48} strokeWidth={1} />
                  </div>
                )}
                <div className={styles.formGrid}>
                  <Input
                    label="Nome do Produto"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  />
                  <div className={styles.row}>
                    <Input
                      label="Preço (¥)"
                      type="number"
                      value={formData.priceJpy}
                      onChange={(e) => setFormData({ ...formData, priceJpy: Number(e.target.value) })}
                      icon={<JapaneseYen size={16} />}
                    />
                    <Input
                      label="Quantidade"
                      type="number"
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <Input
                    label="Variação (Cor/Tamanho)"
                    placeholder="Ex: XL, Blue"
                    value={formData.variation || ''}
                    onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
                  />
                  <Input
                    label="Observações"
                    placeholder="Algum detalhe adicional?"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </Card>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Voltar
              </Button>
              <Button onClick={() => setStep(3)}>
                Próximo Passo <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: COST SUMMARY */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <Card className={styles.costsCard}>
              <div className={styles.costItem}>
                <span>Produto ({formData.quantity}x ¥{formData.priceJpy})</span>
                <span className={styles.costValue}>R$ {costs.productBrl.toFixed(2)}</span>
              </div>
              <div className={styles.costItem}>
                <span>Taxa de Serviço (10%)</span>
                <span className={styles.costValue}>R$ {costs.serviceFee.toFixed(2)}</span>
              </div>
              <div className={styles.costItem}>
                <span>Taxa Fixa Operacional</span>
                <span className={styles.costValue}>R$ {costs.fixedFee.toFixed(2)}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.totalItem}>
                <span>Total Estimado</span>
                <span className={styles.totalValue}>R$ {costs.totalBrl.toFixed(2)}</span>
              </div>
              <p className={styles.disclaimer}>
                * O frete internacional será cobrado separadamente quando o produto chegar ao nosso armazém.
                A cotação utilizada é de R$ {initialExchangeRate.toFixed(4)} por ¥1.
              </p>
            </Card>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Voltar
              </Button>
              <Button onClick={() => setStep(4)}>
                Ir para Pagamento <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <div className={styles.paymentOptions}>
              <Card 
                className={`${styles.paymentCard} ${styles.selected}`}
                onClick={() => {}}
              >
                <div className={styles.paymentHeader}>
                  <WalletIcon size={24} strokeWidth={1.5} />
                  <div>
                    <h3>Saldo da Carteira</h3>
                    <p>Saldo atual: R$ 0,00</p>
                  </div>
                </div>
                <Badge variant="error">Saldo Insuficiente</Badge>
              </Card>

              <Card className={styles.paymentCard} onClick={() => {}}>
                <div className={styles.paymentHeader}>
                  <CreditCard size={24} strokeWidth={1.5} />
                  <div>
                    <h3>Pix Direto</h3>
                    <p>Pague agora e confirme o pedido</p>
                  </div>
                </div>
                <ArrowRight size={20} className={styles.chevron} />
              </Card>
            </div>
            
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft size={16} /> Voltar
              </Button>
              <Button onClick={handleCreateOrder} loading={isLoading}>
                Finalizar Pedido <Check size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
