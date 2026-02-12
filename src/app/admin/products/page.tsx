import Link from 'next/link';
import { Plus, Package, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Products',
};

export default async function AdminProductsPage() {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      product_variants(id, price, stock_count),
      product_images(url, is_primary)
    `)
        .order('created_at', { ascending: false });

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Products</h1>
                <Link href="/admin/products/new" className={styles.addBtn}>
                    <Plus size={16} />
                    Add Product
                </Link>
            </div>

            {products && products.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Variants</th>
                            <th>NSFW</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const variants = product.product_variants || [];
                            const minPrice = variants.length > 0
                                ? Math.min(...variants.map((v: { price: number }) => v.price))
                                : 0;
                            const totalStock = variants.reduce(
                                (sum: number, v: { stock_count: number }) => sum + v.stock_count,
                                0
                            );

                            return (
                                <tr key={product.id}>
                                    <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                        {product.name}
                                    </td>
                                    <td>
                                        {product.is_published ? (
                                            <span className={styles.published}>
                                                <Eye size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                                                Published
                                            </span>
                                        ) : (
                                            <span className={styles.draft}>
                                                <EyeOff size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {variants.length > 1 ? `From ${formatPrice(minPrice)}` : formatPrice(minPrice)}
                                    </td>
                                    <td>
                                        <span style={{ color: totalStock <= 0 ? 'var(--color-error)' : totalStock <= 10 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                                            {totalStock}
                                        </span>
                                    </td>
                                    <td>{variants.length}</td>
                                    <td>{product.is_nsfw ? '18+' : '—'}</td>
                                    <td>
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className={styles.actionBtn}
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <Package size={48} />
                    <h3>No products yet</h3>
                    <p>Create your first product to get started.</p>
                </div>
            )}
        </>
    );
}
