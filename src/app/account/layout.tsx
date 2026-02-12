import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import styles from './account.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account',
};

export default async function AccountLayout({
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

    return (
        <div className={styles.accountPage}>
            <div className="container">
                <div className={styles.accountLayout}>
                    {/* Sidebar */}
                    <nav className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <div className={styles.userName}>
                                {profile?.full_name || 'Welcome'}
                            </div>
                            <div className={styles.userEmail}>
                                {profile?.email || user.email}
                            </div>
                        </div>

                        <Link href="/account" className={styles.sidebarLink}>
                            <User size={16} />
                            Profile
                        </Link>
                        <Link href="/account/orders" className={styles.sidebarLink}>
                            <Package size={16} />
                            Orders
                        </Link>
                        <Link href="/account/wishlist" className={styles.sidebarLink}>
                            <Heart size={16} />
                            Wishlist
                        </Link>
                        <Link href="/account/addresses" className={styles.sidebarLink}>
                            <MapPin size={16} />
                            Addresses
                        </Link>
                        <Link href="/account/settings" className={styles.sidebarLink}>
                            <Settings size={16} />
                            Settings
                        </Link>

                        <form action="/auth/signout" method="POST">
                            <button type="submit" className={styles.signOutBtn}>
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </form>
                    </nav>

                    {/* Content */}
                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </div>
    );
}
