import Link from 'next/link';
import { Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, getStockLabel } from '@/lib/utils';
import styles from './shop.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Browse handcrafted leather goods — belts, wallets, cosplay armor, and more.',
};

interface ShopPageProps {
    searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_nsfw', false)
        .order('sort_order');

    // Fetch products with their variants
    let products;

    if (params.category) {
        // When filtering by category, use inner join
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', params.category)
            .single();

        if (cat) {
            const { data } = await supabase
                .from('products')
                .select(`
                    *,
                    product_categories!inner(category_id),
                    product_variants(id, price, stock_count),
                    product_images(url, alt, is_primary)
                `)
                .eq('is_published', true)
                .eq('is_nsfw', false)
                .eq('product_categories.category_id', cat.id);
            products = data;
        } else {
            products = [];
        }
    } else {
        // Show all products (no category filter)
        const { data } = await supabase
            .from('products')
            .select(`
                *,
                product_variants(id, price, stock_count),
                product_images(url, alt, is_primary)
            `)
            .eq('is_published', true)
            .eq('is_nsfw', false);
        products = data;
    }

    // Calculate min price & total stock for each product
    const productsWithPricing = (products || []).map((product) => {
        const variants = product.product_variants || [];
        const minPrice = variants.length > 0
            ? Math.min(...variants.map((v: { price: number }) => v.price))
            : 0;
        const totalStock = variants.reduce(
            (sum: number, v: { stock_count: number }) => sum + v.stock_count,
            0
        );
        const hasMultiplePrices = variants.length > 1 &&
            new Set(variants.map((v: { price: number }) => v.price)).size > 1;
        const primaryImage = (product.product_images || []).find(
            (img: { is_primary: boolean }) => img.is_primary
        );

        return {
            ...product,
            minPrice,
            totalStock,
            hasMultiplePrices,
            primaryImage,
        };
    });

    return (
        <div className={styles.shopPage}>
            <div className="container">
                <header className={styles.shopHeader}>
                    <h1 className={styles.shopTitle}>The Shop</h1>
                    <p className={styles.shopSubtitle}>
                        Handcrafted leather goods, made with passion
                    </p>
                </header>

                {/* Category Filters */}
                <div className={styles.filters}>
                    <Link
                        href="/shop"
                        className={`${styles.filterBtn} ${!params.category ? styles.filterBtnActive : ''}`}
                    >
                        All
                    </Link>
                    {(categories || []).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className={`${styles.filterBtn} ${params.category === cat.slug ? styles.filterBtnActive : ''}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                    <Link
                        href="/shop/nsfw"
                        className={styles.filterBtn}
                        style={{ borderColor: 'var(--color-plum)', color: 'var(--color-accent-secondary)' }}
                    >
                        🔞 18+ Collection
                    </Link>
                </div>

                {/* Product Grid */}
                {productsWithPricing.length > 0 ? (
                    <div className={styles.productGrid}>
                        {productsWithPricing.map((product) => {
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
                                        {product.is_nsfw && (
                                            <span className={styles.nsfwBadge}>18+</span>
                                        )}
                                        {product.is_custom_order && (
                                            <span className={styles.customBadge}>Custom</span>
                                        )}
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
    );
}
