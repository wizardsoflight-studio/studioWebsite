import { Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings - Coming Soon',
};

export default function SettingsPage() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <Settings size={48} style={{ color: 'var(--color-border)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Account Settings</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
                This feature is coming soon. You'll be able to manage your account preferences and notifications here.
            </p>
        </div>
    );
}
