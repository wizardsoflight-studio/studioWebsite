import { Settings } from 'lucide-react';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Settings',
};

export default function AdminSettingsPage() {
    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Settings</h1>
            </div>
            <div className={styles.emptyState}>
                <Settings size={48} />
                <h3>Settings</h3>
                <p>Store configuration, shipping zones, tax settings, and integrations will be managed here.</p>
            </div>
        </>
    );
}
