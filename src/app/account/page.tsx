import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, UserCog, Settings } from 'lucide-react';
import styles from './account.module.css';

export default async function AccountPage() {
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

    const isAdmin = profile?.role === 'admin';
    const isStaff = profile?.role === 'staff';

    return (
        <>
            <div className={styles.pageHeader}>
                <h2 className={styles.contentTitle}>Profile</h2>
                <div className={styles.adminLinks}>
                    {isAdmin && (
                        <Link href="/admin" className={styles.adminLink}>
                            <Shield size={18} />
                            <span>Admin Dashboard</span>
                        </Link>
                    )}
                    {isStaff && !isAdmin && (
                        <Link href="/admin/staff" className={styles.adminLink}>
                            <UserCog size={18} />
                            <span>Staff Dashboard</span>
                        </Link>
                    )}
                </div>
            </div>

            <form className={styles.profileForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="profile-name">Full Name</label>
                    <input
                        id="profile-name"
                        type="text"
                        className={styles.formInput}
                        defaultValue={profile?.full_name || ''}
                        placeholder="Your name"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="profile-email">Email</label>
                    <input
                        id="profile-email"
                        type="email"
                        className={styles.formInput}
                        defaultValue={profile?.email || user.email || ''}
                        disabled
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="profile-phone">Phone</label>
                    <input
                        id="profile-phone"
                        type="tel"
                        className={styles.formInput}
                        defaultValue={profile?.phone || ''}
                        placeholder="(555) 123-4567"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="profile-role">Account Type</label>
                    <input
                        id="profile-role"
                        type="text"
                        className={styles.formInput}
                        value={profile?.role === 'admin' ? 'Administrator' : profile?.role === 'staff' ? 'Staff Member' : 'Customer'}
                        disabled
                        readOnly
                    />
                </div>

                <button type="submit" className={styles.saveBtn}>
                    Save Changes
                </button>
            </form>
        </>
    );
}
