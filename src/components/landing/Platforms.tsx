import styles from './Platforms.module.css';

const platforms = [
  { name: 'Amazon JP', domain: 'amazon.co.jp', emoji: '📦' },
  { name: 'Mercari', domain: 'mercari.com', emoji: '🛍️' },
  { name: 'Rakuten', domain: 'rakuten.co.jp', emoji: '🏪' },
  { name: 'Yahoo Auctions', domain: 'auctions.yahoo.co.jp', emoji: '🔨' },
  { name: 'Yahoo Shopping', domain: 'shopping.yahoo.co.jp', emoji: '🛒' },
  { name: 'Suruga-ya', domain: 'suruga-ya.jp', emoji: '🎮' },
];

export function Platforms() {
  return (
    <section className={styles.section} id="plataformas">
      <div className={styles.container}>
        <span className={styles.eyebrow}>Plataformas Aceitas</span>
        <h2 className={styles.title}>
          Compre de <span className={styles.accent}>qualquer loja</span> japonesa
        </h2>
        <p className={styles.subtitle}>
          Compramos em todas as principais plataformas de e-commerce do Japão. Basta
          colar o link do produto.
        </p>

        <div className={styles.grid}>
          {platforms.map((p) => (
            <div key={p.domain} className={styles.card}>
              <span className={styles.emoji}>{p.emoji}</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.domain}>{p.domain}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
