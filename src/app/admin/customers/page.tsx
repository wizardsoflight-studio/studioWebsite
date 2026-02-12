import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Customers',
};

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    const { data: customers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Customers</h1>
            </div>

            {customers && customers.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>NSFW</th>
                            <th>Newsletter</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                    {customer.full_name || '—'}
                                </td>
                                <td>{customer.email}</td>
                                <td>{customer.nsfw_enabled ? 'Yes' : 'No'}</td>
                                <td>{customer.newsletter_subscribed ? 'Yes' : 'No'}</td>
                                <td>{formatDate(customer.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <Users size={48} />
                    <h3>No customers yet</h3>
                    <p>Customer profiles will appear here when users sign up.</p>
                </div>
            )}
        </>
    );
}
