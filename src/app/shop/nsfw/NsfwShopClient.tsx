'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShieldAlert } from 'lucide-react';
import { formatPrice, getStockLabel } from '@/lib/utils';
import AgeGate from '@/components/AgeGate';
import styles from '../shop.module.css';

interface NsfwProduct {
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    description: string;
    is_nsfw: boolean;
    is_custom_order: boolean;
    minPrice: number;
    totalStock: number;
    hasMultiplePrices: boolean;
    primaryImage: { url: string; alt: string | null } | null;
}

export default function NsfwShopClient({ products }: { products: NsfwProduct[] }) {
    const [ageVerified, setAgeVerified] = useState(false);

    useEffect(() => {
        setAgeVerified(localStorage.getItem('wol_age_verified') === 'true');

        const handleStorage = () => {
            setAgeVerified(localStorage.getItem('wol_age_verified') === 'true');
        };

        // Re-check when AgeGate confirms
        const interval = setInterval(() => {
            const nowVerified = localStorage.getItem('wol_age_verified') === 'true';
            if (nowVerified !== ageVerified) {
                setAgeVerified(nowVerified);
            }
        }, 500);

        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [ageVerified]);

    return (
        <>
            <AgeGate required={!ageVerified} />

            <div className={styles.shopPage}>
                <div className="container">
                    <header className={styles.shopHeader}>
                        <h1 className={styles.shopTitle}>
                            <ShieldAlert size={32} style={{ marginRight: '12px', verticalAlign: 'text-bottom', color: 'var(--color-accent-secondary)' }} />
                            18+ Collection
                        </h1>
                        <p className={styles.shopSubtitle}>
                            Adult leather goods — handcrafted with the same care and quality
                        </p>
                    </header>

                    <div className={styles.filters}>
                        <Link href="/shop" className={styles.filterBtn}>
                            ← Back to SFW Shop
                        </Link>
                    </div>

                    {products.length > 0 ? (
                        <div className={styles.productGrid}>
                            {products.map((product) => {
                                const stockLabel = getStockLabel(product.totalStock);
                                return (
                                    <Link
                                        key={product.id}
                                        href={`/shop/${product.slug}`}
                                        className={styles.productCard}
                                    >
                                        <div className={styles.productImageWrapper}>
                                            {product.primaryImage ? (
                                                <img
                                                    src={product.primaryImage.url}
                                                    alt={product.primaryImage.alt || product.name}
                                                    className={styles.productImage}
                                                />
                                            ) : (
                                                <Package size={48} className={styles.productImagePlaceholder} />
                                            )}
                                            <span className={styles.nsfwBadge}>18+</span>
                                            {stockLabel && (
                                                <span
                                                    className={`${styles.stockBadge} ${stockLabel === 'Out of Stock'
                                                            ? styles.stockOut
                                                            : styles.stockLimited
                                                        }`}
                                                >
                                                    {stockLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.productInfo}>
                                            <h3 className={styles.productName}>{product.name}</h3>
                                            <p className={styles.productDescription}>
                                                {product.short_description || product.description}
                                            </p>
                                            <div className={styles.productPrice}>
                                                {product.hasMultiplePrices && (
                                                    <span className={styles.priceFrom}>From</span>
                                                )}
                                                {formatPrice(product.minPrice)}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <h3>No products found</h3>
                            <p>Check back soon — new items are always in the works!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
