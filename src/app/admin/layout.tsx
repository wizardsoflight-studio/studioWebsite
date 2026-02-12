import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Package, ShoppingCart, Users, Settings, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import styles from './admin.module.css';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user has admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['owner', 'manager', 'content_editor', 'fulfillment'].includes(profile.role)) {
        redirect('/');
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Admin</div>
                <nav className={styles.sidebarNav}>
                    <Link href="/admin" className={styles.sidebarLink}>
                        <BarChart3 size={16} />
                        Dashboard
                    </Link>
                    <Link href="/admin/products" className={styles.sidebarLink}>
                        <Package size={16} />
                        Products
                    </Link>
                    <Link href="/admin/orders" className={styles.sidebarLink}>
                        <ShoppingCart size={16} />
                        Orders
                    </Link>
                    <Link href="/admin/categories" className={styles.sidebarLink}>
                        <Tag size={16} />
                        Categories
                    </Link>
                    <Link href="/admin/customers" className={styles.sidebarLink}>
                        <Users size={16} />
                        Customers
                    </Link>
                    <Link href="/admin/settings" className={styles.sidebarLink}>
                        <Settings size={16} />
                        Settings
                    </Link>
                </nav>
            </aside>

            <main className={styles.content}>{children}</main>
        </div>
    );
}
