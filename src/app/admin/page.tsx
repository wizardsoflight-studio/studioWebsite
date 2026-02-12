import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDate } from '@/lib/utils';
import styles from './admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch stats
    const [
        { count: totalOrders },
        { count: totalProducts },
        { count: totalCustomers },
        { data: recentOrders },
    ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase
            .from('orders')
            .select('id, order_number, status, total, created_at, profiles!inner(full_name, email)')
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    // Calculate revenue
    const { data: paidOrders } = await supabase
        .from('orders')
        .select('total')
        .in('status', ['paid', 'processing', 'shipped', 'delivered']);

    const totalRevenue = (paidOrders || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
    );

    const statusStyles: Record<string, string> = {
        pending: styles.statusPending,
        paid: styles.statusPaid,
        processing: styles.statusProcessing,
        shipped: styles.statusShipped,
        delivered: styles.statusDelivered,
        cancelled: styles.statusCancelled,
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>
                        <DollarSign size={14} />
                        Total Revenue
                    </div>
                    <div className={styles.statValue}>{formatPrice(totalRevenue)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>
                        <ShoppingCart size={14} />
                        Orders
                    </div>
                    <div className={styles.statValue}>{totalOrders || 0}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>
                        <Package size={14} />
                        Products
                    </div>
                    <div className={styles.statValue}>{totalProducts || 0}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>
                        <Users size={14} />
                        Customers
                    </div>
                    <div className={styles.statValue}>{totalCustomers || 0}</div>
                </div>
            </div>

            {/* Recent Orders */}
            <h2 style={{ fontFamily: 'var(--font-subtitle)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-lg)' }}>
                Recent Orders
            </h2>

            {recentOrders && recentOrders.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => {
                            const profile = order.profiles as unknown as { full_name: string; email: string };
                            return (
                                <tr key={order.id}>
                                    <td>#{order.order_number || order.id.slice(0, 8)}</td>
                                    <td>{profile?.full_name || profile?.email || 'Guest'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${statusStyles[order.status] || ''}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{formatPrice(order.total)}</td>
                                    <td>{formatDate(order.created_at)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <ShoppingCart size={48} />
                    <h3>No orders yet</h3>
                    <p>Orders will appear here once customers start purchasing.</p>
                </div>
            )}
        </>
    );
}
