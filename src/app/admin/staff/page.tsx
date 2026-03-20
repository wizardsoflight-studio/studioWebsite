import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Package, ShoppingCart, MessageSquare, FileText } from 'lucide-react';
import styles from './staff.module.css';

export default async function StaffDashboard() {
    const supabase = await createClient();
    
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Redirect non-staff/non-admin users
    if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
        redirect('/account');
    }

    return (
        <div className={styles.staffDashboard}>
            <div className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.dashboardTitle}>Staff Dashboard</h1>
                    <p className={styles.dashboardSubtitle}>Manage orders and customer support</p>
                </div>
                <div className={styles.staffBadge}>
                    <span>Staff Access</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.actionsGrid}>
                <a href="/admin/orders" className={styles.actionCard}>
                    <div className={styles.actionIcon}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className={styles.actionContent}>
                        <h3>Orders</h3>
                        <p>View and manage customer orders</p>
                    </div>
                </a>

                <a href="/admin/products" className={styles.actionCard}>
                    <div className={styles.actionIcon}>
                        <Package size={24} />
                    </div>
                    <div className={styles.actionContent}>
                        <h3>Products</h3>
                        <p>Manage product inventory</p>
                    </div>
                </a>

                <a href="/admin/messages" className={styles.actionCard}>
                    <div className={styles.actionIcon}>
                        <MessageSquare size={24} />
                    </div>
                    <div className={styles.actionContent}>
                        <h3>Messages</h3>
                        <p>Customer inquiries and support</p>
                    </div>
                </a>

                <a href="/admin/reports" className={styles.actionCard}>
                    <div className={styles.actionIcon}>
                        <FileText size={24} />
                    </div>
                    <div className={styles.actionContent}>
                        <h3>Reports</h3>
                        <p>View sales and activity reports</p>
                    </div>
                </a>
            </div>

            {/* Staff Notes */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Staff Notes</h2>
                <div className={styles.notesCard}>
                    <p className={styles.notePlaceholder}>
                        Staff notes and internal communications will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}
