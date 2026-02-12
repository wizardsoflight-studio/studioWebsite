import { createClient } from '@/lib/supabase/server';
import styles from './account.module.css';

export default async function AccountPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.contentTitle}>Profile</h2>
                {profile?.role === 'owner' && (
                    <a href="/admin" style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}>
                        Admin Dashboard
                    </a>
                )}
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
                        defaultValue={profile?.email || user!.email || ''}
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

                <button type="submit" className={styles.saveBtn}>
                    Save Changes
                </button>
            </form>
        </>
    );
}
