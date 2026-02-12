import { Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDate } from '@/lib/utils';
import styles from '../account.module.css';

export default async function OrdersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

    const statusStyles: Record<string, string> = {
        pending: styles.statusPending,
        processing: styles.statusProcessing,
        shipped: styles.statusShipped,
        delivered: styles.statusDelivered,
    };

    return (
        <>
            <h2 className={styles.contentTitle}>Orders</h2>
            {orders && orders.length > 0 ? (
                <div className={styles.ordersList}>
                    {orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div>
                                <div className={styles.orderNumber}>
                                    #{order.order_number}
                                </div>
                                <div className={styles.orderDate}>
                                    {formatDate(order.created_at)}
                                </div>
                            </div>
                            <span
                                className={`${styles.orderStatus} ${statusStyles[order.status] || ''}`}
                            >
                                {order.status}
                            </span>
                            <span className={styles.orderTotal}>
                                {formatPrice(order.total)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Package size={48} />
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here once you make a purchase.</p>
                </div>
            )}
        </>
    );
}
