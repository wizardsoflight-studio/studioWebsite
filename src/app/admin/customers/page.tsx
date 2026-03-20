import { Users, Shield } from 'lucide-react';
import { createClient, getAuthUser, getUserProfile } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import styles from '../admin.module.css';
import { promoteUser, demoteUser } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Users & Staff',
};

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    // Determine if the current user is an admin
    const { user: authUser } = await getAuthUser();
    const { profile: currentProfile } = await getUserProfile(authUser?.id || '');
    const isCurrentAdmin = currentProfile?.role === 'admin';

    // Fetch ALL users instead of just customers
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Users & Staff</h1>
            </div>

            {users && users.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            {isCurrentAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                    {u.full_name || '—'}
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`${styles.roleBadge} ${styles[`${u.role}Role`] || styles.customerRole}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>{formatDate(u.created_at)}</td>
                                {isCurrentAdmin && (
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {u.id !== currentProfile?.id && (
                                                <>
                                                    {u.role === 'customer' && (
                                                        <>
                                                            <form action={promoteUser} className={styles.inlineForm}>
                                                                <input type="hidden" name="userId" value={u.id} />
                                                                <input type="hidden" name="role" value="staff" />
                                                                <button type="submit" className={styles.promoteBtn}>Make Staff</button>
                                                            </form>
                                                            <form action={promoteUser} className={styles.inlineForm}>
                                                                <input type="hidden" name="userId" value={u.id} />
                                                                <input type="hidden" name="role" value="admin" />
                                                                <button type="submit" className={styles.promoteBtn}>Make Admin</button>
                                                            </form>
                                                        </>
                                                    )}
                                                    {u.role === 'staff' && (
                                                        <>
                                                            <form action={promoteUser} className={styles.inlineForm}>
                                                                <input type="hidden" name="userId" value={u.id} />
                                                                <input type="hidden" name="role" value="admin" />
                                                                <button type="submit" className={styles.promoteBtn}>Make Admin</button>
                                                            </form>
                                                            <form action={demoteUser} className={styles.inlineForm}>
                                                                <input type="hidden" name="userId" value={u.id} />
                                                                <button type="submit" className={styles.demoteBtn}>Revoke Access</button>
                                                            </form>
                                                        </>
                                                    )}
                                                    {u.role === 'admin' && (
                                                        <form action={demoteUser} className={styles.inlineForm}>
                                                            <input type="hidden" name="userId" value={u.id} />
                                                            <button type="submit" className={styles.demoteBtn}>Revoke Admin</button>
                                                        </form>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <Users size={48} />
                    <h3>No users yet</h3>
                    <p>Profiles will appear here when users sign up.</p>
                </div>
            )}
        </>
    );
}
