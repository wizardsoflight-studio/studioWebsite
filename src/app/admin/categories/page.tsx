import { Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Categories',
};

export default async function AdminCategoriesPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from('categories')
        .select('*, product_categories(product_id)')
        .order('sort_order');

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Categories</h1>
            </div>

            {categories && categories.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Products</th>
                            <th>NSFW</th>
                            <th>Sort Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                    {cat.name}
                                </td>
                                <td>{cat.slug}</td>
                                <td>{(cat.product_categories as unknown as unknown[])?.length || 0}</td>
                                <td>{cat.is_nsfw ? '18+' : '—'}</td>
                                <td>{cat.sort_order}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <Tag size={48} />
                    <h3>No categories</h3>
                    <p>Add categories to organize your products.</p>
                </div>
            )}
        </>
    );
}
