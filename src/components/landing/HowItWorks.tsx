import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    icon: '🔗',
    title: 'Envie o link',
    description:
      'Cole a URL do produto de qualquer loja japonesa. Nós buscamos foto, nome e preço automaticamente.',
  },
  {
    number: '02',
    icon: '💳',
    title: 'Pague com Pix',
    description:
      'Pague via Pix instantâneo ou use seu saldo na carteira NipponBox. Sem cartão internacional.',
  },
  {
    number: '03',
    icon: '📦',
    title: 'Armazene no JP',
    description:
      'Compramos e guardamos no armazém. Consolide vários itens em um único envio para economizar no frete.',
  },
  {
    number: '04',
    icon: '✈️',
    title: 'Receba no Brasil',
    description:
      'Escolha o método de frete ideal — de econômico a expresso — e acompanhe cada etapa até sua porta.',
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section} id="como-funciona">
      <div className={styles.container}>
        <span className={styles.eyebrow}>Como Funciona</span>
        <h2 className={styles.title}>
          Do Japão ao Brasil em <span className={styles.accent}>4 passos</span>
        </h2>

        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.number} className={styles.step}>
              <span className={styles.stepNumber}>{step.number}</span>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
