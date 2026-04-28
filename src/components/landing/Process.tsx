import { Search, PackageOpen, PlaneTakeoff } from 'lucide-react';
import styles from './Process.module.css';

export function Process() {
  const steps = [
    {
      num: '01',
      title: 'Sourcing & Aquisição',
      desc: 'Navegue pelo Yahoo Auctions, Mercari ou Rakuten. Cole o link do produto em nosso dashboard e nós efetuamos a compra imediatamente, superando restrições locais.',
      icon: <Search size={32} strokeWidth={1} />,
    },
    {
      num: '02',
      title: 'Consolidação Física',
      desc: 'Os itens chegam ao nosso armazém em Tóquio. Oferecemos 60 dias de armazenamento gratuito. Consolidamos múltiplas compras em uma única caixa para reduzir drasticamente o frete.',
      icon: <PackageOpen size={32} strokeWidth={1} />,
    },
    {
      num: '03',
      title: 'Despacho Global',
      desc: 'Escolha a transportadora (EMS, DHL, FedEx). Reforçamos a embalagem gratuitamente e cuidamos da declaração alfandegária para um trânsito internacional fluido.',
      icon: <PlaneTakeoff size={32} strokeWidth={1} />,
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>A mecânica<br/>da importação.</h2>
          <p className={styles.subtitle}>Um fluxo logístico projetado para máxima eficiência e controle total.</p>
        </div>

        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.num} className={styles.card}>
              <div className={styles.iconWrapper}>{step.icon}</div>
              <span className={styles.stepNumber}>{step.num}</span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
