import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import styles from '../checkout.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Cancelled',
};

export default function CheckoutCancelPage() {
    return (
        <div className={styles.successPage}>
            <div className={styles.successCard}>
                <div className={styles.successIcon} style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                    <XCircle size={36} style={{ color: 'var(--color-error)' }} />
                </div>

                <h1 className={styles.successTitle}>Payment Cancelled</h1>

                <p className={styles.successMsg}>
                    Your payment was cancelled. Don&apos;t worry — your items are still saved in your cart.
                    When you&apos;re ready, you can try again.
                </p>

                <div className={styles.successActions}>
                    <Link href="/cart" className={styles.primaryBtn}>
                        <ArrowLeft size={16} />
                        Back to Cart
                    </Link>
                    <Link href="/shop" className={styles.secondaryBtn}>
                        <ShoppingBag size={16} />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
