'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, Shield, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import PayPalCheckout from '@/components/checkout/PayPalCheckout'; // Import PayPal component
import styles from './checkout.module.css';

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, []);

    // Redirect if cart is empty
    if (items.length === 0 && typeof window !== 'undefined') {
        router.push('/cart');
        return null;
    }

    // Separate SFW and NSFW items
    const sfwItems = items.filter((item) => !item.isNsfw);
    const nsfwItems = items.filter((item) => item.isNsfw);

    const handleStripeCheckout = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: sfwItems.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Checkout failed');
                setLoading(false);
                return;
            }

            if (data.url) {
                // Clear cart and redirect to Stripe
                clearCart();
                window.location.href = data.url;
            }
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutPage}>
            <div className="container">
                <h1 className={styles.pageTitle}>Checkout</h1>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.checkoutLayout}>
                    {/* Left: Forms */}
                    <div>
                        {nsfwItems.length > 0 && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    <Shield size={20} />
                                    Adult Content Notice
                                </h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                    {nsfwItems.length} item(s) in your cart are flagged as 18+. These items are processed
                                    through a separate payment provider (PaymentCloud). You will complete that purchase in a
                                    separate step after this SFW checkout.
                                </p>
                            </div>
                        )}

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <CreditCard size={20} />
                                Payment
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                                You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your payment.
                                Shipping address will be collected there.
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                {['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'].map((pm) => (
                                    <span
                                        key={pm}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: 'var(--text-xs)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        {pm}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.summaryItems}>
                            {sfwItems.map((item) => (
                                <div key={item.variantId} className={styles.summaryItem}>
                                    <div className={styles.summaryItemInfo}>
                                        <div className={styles.summaryItemName}>{item.productName}</div>
                                        <div className={styles.summaryItemMeta}>
                                            {item.variantName} × {item.quantity}
                                        </div>
                                    </div>
                                    <div className={styles.summaryItemPrice}>
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>Calculated next</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax</span>
                            <span>Calculated next</span>
                        </div>

                        <div className={styles.summaryTotal}>
                            <span>Estimated Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <button
                            className={`${styles.payBtn} ${styles.stripeBtn}`}
                            onClick={handleStripeCheckout}
                            disabled={loading || sfwItems.length === 0}
                        >
                            {loading ? (
                                'Redirecting to Stripe...'
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Pay with Stripe
                                </>
                            )}
                        </button>

                        <div className={styles.divider}>
                            <span>Or pay with</span>
                        </div>

                        {/* PayPal Integration */}
                        <div className={styles.paypalContainer}>
                            <PayPalCheckout shippingDetails={{}} userId={userId} />
                        </div>

                        <div className={styles.secureNote}>
                            <Shield size={14} />
                            256-bit SSL encrypted checkout
                        </div>

                        <Link
                            href="/cart"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                marginTop: 'var(--space-md)',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            ← Back to Cart
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
