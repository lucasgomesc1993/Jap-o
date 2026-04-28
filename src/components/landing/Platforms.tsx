import styles from './Platforms.module.css';

export function Platforms() {
  const stores = [
    'Yahoo Auctions', 'Mercari', 'Rakuten', 'Surugaya', 
    'Amazon JP', 'Zozotown', 'Mandarake', 'Pokemon Center'
  ];

  // Duplicar para o efeito infinito
  const duplicatedStores = [...stores, ...stores];

  return (
    <section className={styles.section}>
      <div className={styles.label}>Integração nativa com os gigantes locais</div>
      
      <div className={styles.marquee}>
        {duplicatedStores.map((store, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <span className={styles.storeName}>{store}</span>
            {idx < duplicatedStores.length - 1 && (
              <span className={styles.separator}>✦</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
