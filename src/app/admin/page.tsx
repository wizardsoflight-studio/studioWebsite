import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { promoteUser, demoteUser } from './customers/actions';
import { Users, Package, ShoppingCart, TrendingUp, Shield, UserCog } from 'lucide-react';
import styles from './admin.module.css';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user's role directly from the profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();

    // Redirect non-admins to appropriate fallback pages
    if (profile?.role !== 'admin') {
        if (profile?.role === 'staff') {
            redirect('/admin/staff');
        }
        redirect('/account');
    }

    // Fetch dashboard stats - handle potential errors
    const { data: stats } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

    // Fetch all users with roles for management
    const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('role', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
                    <p className={styles.dashboardSubtitle}>Manage users, roles, and view statistics</p>
                </div>
                <div className={styles.adminBadge}>
                    <Shield size={18} />
                    <span>Admin Access</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats?.total_users || 0}</div>
                        <div className={styles.statLabel}>Total Users</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Shield size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats?.total_admins || 0}</div>
                        <div className={styles.statLabel}>Admins</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <UserCog size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats?.total_staff || 0}</div>
                        <div className={styles.statLabel}>Staff Members</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats?.active_users_7d || 0}</div>
                        <div className={styles.statLabel}>Active (7 days)</div>
                    </div>
                </div>
            </div>

            {/* User Management */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>User Management</h2>
                <div className={styles.userTable}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableCol}>User</div>
                        <div className={styles.tableCol}>Role</div>
                        <div className={styles.tableCol}>Joined</div>
                        <div className={styles.tableCol}>Actions</div>
                    </div>
                    {allUsers?.map((userProfile) => (
                        <div key={userProfile.id} className={styles.tableRow}>
                            <div className={styles.tableCell}>
                                <div className={styles.userName}>
                                    {userProfile.full_name || '—'}
                                </div>
                                <div className={styles.userEmail}>{userProfile.email}</div>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={`${styles.roleBadge} ${styles[`${userProfile.role}Role`]}`}>
                                    {userProfile.role}
                                </span>
                            </div>
                            <div className={styles.tableCell}>
                                {new Date(userProfile.created_at).toLocaleDateString()}
                            </div>
                            <div className={styles.tableCell}>
                                {profile.role === 'admin' && userProfile.id !== user.id && (
                                    <div className={styles.actionButtons}>
                                        {userProfile.role !== 'admin' && (
                                            <form action={promoteUser} className={styles.inlineForm}>
                                                <input type="hidden" name="userId" value={userProfile.id} />
                                                <input type="hidden" name="role" value={userProfile.role === 'staff' ? 'admin' : 'staff'} />
                                                <button type="submit" className={styles.promoteBtn}>
                                                    {userProfile.role === 'staff' ? 'Promote to Admin' : 'Make Staff'}
                                                </button>
                                            </form>
                                        )}
                                        {userProfile.role !== 'customer' && (
                                            <form action={demoteUser} className={styles.inlineForm}>
                                                <input type="hidden" name="userId" value={userProfile.id} />
                                                <button type="submit" className={styles.demoteBtn}>
                                                    Remove Role
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.quickActions}>
                    <Link href="/admin/products" className={styles.actionCard}>
                        <Package size={24} />
                        <span>Manage Products</span>
                    </Link>
                    <Link href="/admin/orders" className={styles.actionCard}>
                        <ShoppingCart size={24} />
                        <span>View Orders</span>
                    </Link>
                    <Link href="/admin/settings" className={styles.actionCard}>
                        <UserCog size={24} />
                        <span>Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
