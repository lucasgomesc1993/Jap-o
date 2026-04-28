import styles from './Philosophy.module.css';

export function Philosophy() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div>
          <span className={styles.label}>Nossa Filosofia</span>
          <h2 className={styles.title}>Comprar no Japão sempre foi complexo. Nós mudamos isso.</h2>
        </div>
        
        <div className={styles.textBlock}>
          <p className={styles.paragraph}>
            A maioria dos serviços de proxy é um labirinto de taxas ocultas, interfaces confusas e comunicação lenta. Nós acreditamos que acessar o mercado japonês deve ser tão <strong>simples quanto comprar no seu país.</strong>
          </p>
          <p className={styles.paragraph}>
            Construímos uma infraestrutura logística proprietária e uma interface obsessivamente refinada para que você possa focar no que importa: <strong>encontrar itens extraordinários.</strong> Nós cuidamos do armazenamento, reembalagem e despacho aduaneiro.
          </p>
        </div>
      </div>
    </section>
  );
}
