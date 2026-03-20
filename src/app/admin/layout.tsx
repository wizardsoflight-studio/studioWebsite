import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Package, ShoppingCart, Users, Settings, Tag, Shield } from 'lucide-react';
import { getAuthUser, getUserProfile } from '@/lib/supabase/server';
import styles from './admin.module.css';

type AdminRole = 'admin' | 'staff';

const ROLE_NAV: Record<AdminRole, string[]> = {
    staff: ['orders', 'products', 'customers'],
    admin: ['dashboard', 'products', 'orders', 'categories', 'customers', 'settings'],
};

const ROLE_LABELS: Record<AdminRole, string> = {
    admin: 'Admin',
    staff: 'Staff',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await getAuthUser();

    if (!user) {
        redirect('/login?redirect=/admin');
    }

    const { profile } = await getUserProfile(user.id);

    const adminRoles: AdminRole[] = ['admin', 'staff'];
    if (!profile || !adminRoles.includes(profile.role as AdminRole)) {
        redirect('/');
    }

    const role = profile.role as AdminRole;
    const allowedPages = ROLE_NAV[role];

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                {/* Role badge */}
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarTitle}>Admin Panel</div>
                    <div className={`${styles.roleBadge} ${styles[`role_${role}`]}`}>
                        <Shield size={10} />
                        {ROLE_LABELS[role]}
                    </div>
                    {profile.full_name && (
                        <div className={styles.sidebarUser}>{profile.full_name}</div>
                    )}
                </div>

                <nav className={styles.sidebarNav}>
                    {allowedPages.includes('dashboard') && (
                        <Link href="/admin" className={styles.sidebarLink}>
                            <BarChart3 size={16} />
                            Dashboard
                        </Link>
                    )}
                    {allowedPages.includes('products') && (
                        <Link href="/admin/products" className={styles.sidebarLink}>
                            <Package size={16} />
                            Products
                        </Link>
                    )}
                    {allowedPages.includes('orders') && (
                        <Link href="/admin/orders" className={styles.sidebarLink}>
                            <ShoppingCart size={16} />
                            Orders
                        </Link>
                    )}
                    {allowedPages.includes('categories') && (
                        <Link href="/admin/categories" className={styles.sidebarLink}>
                            <Tag size={16} />
                            Collections
                        </Link>
                    )}
                    {allowedPages.includes('customers') && (
                        <Link href="/admin/customers" className={styles.sidebarLink}>
                            <Users size={16} />
                            Customers
                        </Link>
                    )}
                    {allowedPages.includes('settings') && (
                        <Link href="/admin/settings" className={styles.sidebarLink}>
                            <Settings size={16} />
                            Settings
                        </Link>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.sidebarLink} style={{ fontSize: '0.7rem' }}>
                        ← Back to Store
                    </Link>
                </div>
            </aside>

            <main className={styles.content}>{children}</main>
        </div>
    );
}
