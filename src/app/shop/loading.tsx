import styles from './shop.module.css';

// Shown by Next.js while the async ShopPage server component is loading
export default function ShopLoading() {
    return (
        <div className={styles.shopPage}>
            <div className="container">
                <header className={styles.shopHeader}>
                    <div style={{ width: 180, height: 40, borderRadius: 6, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ width: 280, height: 20, borderRadius: 4, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite', marginTop: 12 }} />
                </header>

                {/* Filter skeleton */}
                <div className={styles.filters} style={{ gap: 8 }}>
                    {[80, 100, 120, 90].map((w, i) => (
                        <div key={i} style={{ width: w, height: 36, borderRadius: 20, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>

                {/* Product grid skeleton */}
                <div className={styles.productGrid}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={styles.productCard} style={{ pointerEvents: 'none' }}>
                            <div className={styles.productImageWrapper} style={{ background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            <div className={styles.productInfo}>
                                <div style={{ width: '70%', height: 18, borderRadius: 4, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 8 }} />
                                <div style={{ width: '90%', height: 14, borderRadius: 4, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 4 }} />
                                <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--color-bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
