'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: "Por que não comprar diretamente das lojas?",
    answer: "A esmagadora maioria do e-commerce japonês (como Mercari e Yahoo Auctions) não aceita cartões de crédito estrangeiros e não envia para fora do Japão. Nós agimos como seu endereço e meio de pagamento local."
  },
  {
    question: "Como funciona a consolidação de pacotes?",
    answer: "Você pode comprar dezenas de itens de lojas diferentes ao longo de 60 dias (armazenamento gratuito). Quando estiver pronto, nós colocamos tudo em uma única caixa otimizada. Isso reduz o custo de frete internacional em até 70% comparado a envios individuais."
  },
  {
    question: "Existem taxas ocultas?",
    answer: "Zero. Nossa taxa de serviço é fixa em 0% sobre o valor do produto para os usuários Beta. Você paga apenas o valor do item, eventuais fretes locais dentro do Japão, e o frete internacional final."
  },
  {
    question: "Qual o prazo médio de entrega?",
    answer: "Depende do método escolhido. O EMS (Expresso) leva entre 7 a 14 dias úteis para o Brasil. Modalidades marítimas podem levar de 2 a 3 meses, mas são significativamente mais baratas para caixas pesadas."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Transparência</span>
          <h2 className={styles.title}>Perguntas Frequentes.</h2>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <button 
                className={styles.questionWrapper} 
                onClick={() => toggle(index)}
              >
                <span className={styles.question}>{faq.question}</span>
                <Plus size={32} strokeWidth={1} className={styles.icon} />
              </button>
              <div className={styles.answer}>
                <div className={styles.answerInner}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
