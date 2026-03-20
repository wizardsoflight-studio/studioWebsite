import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Addresses - Coming Soon',
};

export default function AddressesPage() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <MapPin size={48} style={{ color: 'var(--color-border)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Saved Addresses</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
                This feature is coming soon. You'll be able to manage your shipping and billing addresses here.
            </p>
        </div>
    );
}
