import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import styles from '../checkout.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Confirmed',
};

export default function CheckoutSuccessPage() {
    return (
        <div className={styles.successPage}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>
                    <CheckCircle size={36} />
                </div>

                <h1 className={styles.successTitle}>Order Confirmed!</h1>

                <p className={styles.successMsg}>
                    Thank you for your purchase! Your order is being prepared with care.
                    You&apos;ll receive an email confirmation shortly with your order details and tracking information.
                </p>

                <div className={styles.successActions}>
                    <Link href="/account/orders" className={styles.primaryBtn}>
                        <Package size={16} />
                        View Orders
                    </Link>
                    <Link href="/shop" className={styles.secondaryBtn}>
                        Continue Shopping
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
