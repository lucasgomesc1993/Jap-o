'use client';

import React, { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: 'Quais plataformas japonesas vocês aceitam?',
    answer:
      'Aceitamos compras de qualquer loja japonesa que faça envio dentro do Japão, incluindo Amazon JP, Mercari, Rakuten, Yahoo Auctions, Yahoo Shopping, Suruga-ya, entre outras. Basta colar o link do produto.',
  },
  {
    question: 'Preciso de cartão internacional?',
    answer:
      'Não! Nós compramos o produto para você com nosso cartão local. Você paga apenas via Pix ou usando o saldo da sua carteira NipponBox, tudo em reais.',
  },
  {
    question: 'O que é consolidação de envio?',
    answer:
      'Quando você compra múltiplos itens, todos ficam armazenados no nosso armazém no Japão. Você pode esperar acumular vários pedidos e enviá-los juntos em um único pacote, economizando significativamente no frete internacional.',
  },
  {
    question: 'Quanto tempo leva para receber meu pedido?',
    answer:
      'Depende do método de frete escolhido: SAL leva aproximadamente 45 dias, EMS cerca de 15 dias, e os serviços expressos (DHL/FedEx) chegam em aproximadamente 5 dias após o envio do Japão.',
  },
  {
    question: 'Vocês fazem verificação de qualidade?',
    answer:
      'Sim! Oferecemos o serviço de Quality Check como extra. Ao chegar no armazém, inspecionamos seu item e tiramos fotos detalhadas para garantir que está em perfeitas condições antes do envio ao Brasil.',
  },
  {
    question: 'Como funciona a declaração aduaneira?',
    answer:
      'Oferecemos duas opções: declaração com valor real (recomendado) ou valor manual. Na declaração manual, você assume a responsabilidade e o aceite é registrado com IP e timestamp para segurança.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <span className={styles.eyebrow}>FAQ</span>
        <h2 className={styles.title}>
          Perguntas <span className={styles.accent}>frequentes</span>
        </h2>

        <div className={styles.accordion}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                <button
                  className={styles.trigger}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className={styles.question}>{faq.question}</span>
                  <span className={styles.chevron}>{isOpen ? '−' : '+'}</span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={styles.answer}
                  role="region"
                  hidden={!isOpen}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
