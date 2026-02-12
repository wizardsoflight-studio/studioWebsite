import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, Shield, Truck, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, getStockLabel } from '@/lib/utils';
import styles from './detail.module.css';
import type { Metadata } from 'next';
import ProductActions from './ProductActions';
import AgeGate from '@/components/AgeGate';
import ProductGallery from '@/components/shop/ProductGallery';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('name, short_description')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (!product) return { title: 'Product Not Found' };

    return {
        title: product.name,
        description: product.short_description || `Handcrafted ${product.name} by Wizard Of Light`,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select(`
      *,
      product_variants(*),
      product_images(*)
    `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (!product) {
        notFound();
    }

    const variants = product.product_variants || [];
    const images = product.product_images || [];
    const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0];
    const minPrice = variants.length > 0
        ? Math.min(...variants.map((v: { price: number }) => v.price))
        : 0;
    const totalStock = variants.reduce(
        (sum: number, v: { stock_count: number }) => sum + v.stock_count,
        0
    );
    const stockLabel = getStockLabel(totalStock);
    const hasMultiplePrices = variants.length > 1 &&
        new Set(variants.map((v: { price: number }) => v.price)).size > 1;

    // Extract unique option keys (e.g., "size", "color")
    const optionKeys: string[] = [];
    variants.forEach((v: { options: Record<string, string> }) => {
        Object.keys(v.options || {}).forEach((key) => {
            if (!optionKeys.includes(key)) optionKeys.push(key);
        });
    });

    return (
        <div className={styles.detailPage}>
            {product.is_nsfw && <AgeGate required />}
            <div className="container">
                <Link href="/shop" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Shop
                </Link>

                <div className={styles.productLayout}>
                    {/* Image Section */}
                    <div className={styles.imageSection}>
                        <ProductGallery
                            images={images}
                            videoUrl={product.video_url}
                            productName={product.name}
                        />
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        {/* Badges */}
                        <div className={styles.productBadges}>
                            {product.is_nsfw && (
                                <span className={`${styles.badge} ${styles.badgeNsfw}`}>18+</span>
                            )}
                            {product.is_custom_order && (
                                <span className={`${styles.badge} ${styles.badgeCustom}`}>Custom Order</span>
                            )}
                            {stockLabel && (
                                <span className={`${styles.badge} ${stockLabel === 'Out of Stock' ? styles.badgeOutOfStock : styles.badgeLimited
                                    }`}>
                                    {stockLabel}
                                </span>
                            )}
                        </div>

                        <h1 className={styles.productTitle}>{product.name}</h1>

                        <div className={styles.productPrice}>
                            {hasMultiplePrices && (
                                <span className={styles.priceFrom}>From </span>
                            )}
                            {formatPrice(minPrice)}
                        </div>

                        <p className={styles.description}>{product.description}</p>

                        {/* Client-side variant selection and add-to-cart */}
                        <ProductActions
                            variants={variants.map((v: { id: string; name: string; price: number; stock_count: number; options: Record<string, string>; compare_at_price: number | null }) => ({
                                id: v.id,
                                name: v.name,
                                price: v.price,
                                stock_count: v.stock_count,
                                options: v.options,
                                compare_at_price: v.compare_at_price,
                            }))}
                            optionKeys={optionKeys}
                            isCustomOrder={product.is_custom_order}
                            productName={product.name}
                            productSlug={product.slug}
                            productImage={primaryImage?.url || null}
                            productId={product.id}
                            isNsfw={product.is_nsfw}
                        />

                        {/* Meta */}
                        <div className={styles.productMeta}>
                            <div className={styles.metaItem}>
                                <Shield size={16} />
                                <span>Handcrafted with premium full-grain leather</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Truck size={16} />
                                <span>Free shipping on orders over $100</span>
                            </div>
                            <div className={styles.metaItem}>
                                <RotateCcw size={16} />
                                <span>30-day return policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
