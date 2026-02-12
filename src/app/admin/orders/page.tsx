import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDate } from '@/lib/utils';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Orders',
};

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from('orders')
        .select(`
      *,
      profiles(full_name, email),
      order_items(id, product_name, variant_name, quantity, unit_price, total_price)
    `)
        .order('created_at', { ascending: false });

    const statusStyles: Record<string, string> = {
        pending: styles.statusPending,
        paid: styles.statusPaid,
        processing: styles.statusProcessing,
        shipped: styles.statusShipped,
        delivered: styles.statusDelivered,
        cancelled: styles.statusCancelled,
        refunded: styles.statusCancelled,
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Orders</h1>
            </div>

            {orders && orders.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const profile = order.profiles as unknown as { full_name: string; email: string } | null;
                            const items = order.order_items || [];
                            return (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                        #{order.order_number || order.id.slice(0, 8)}
                                    </td>
                                    <td>{profile?.full_name || profile?.email || 'Guest'}</td>
                                    <td>{items.length} item{items.length !== 1 ? 's' : ''}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${statusStyles[order.status] || ''}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {order.payment_processor || '—'}
                                    </td>
                                    <td>{formatPrice(order.total)}</td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className={styles.actionBtn}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <ShoppingCart size={48} />
                    <h3>No orders yet</h3>
                    <p>Orders will appear once customers complete checkout.</p>
                </div>
            )}
        </>
    );
}
