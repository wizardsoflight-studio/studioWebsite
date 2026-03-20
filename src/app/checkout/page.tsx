'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Mail, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import styles from './checkout.module.css';

export default function CheckoutPage() {
    const { items, subtotal } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items.length, router]);

    if (items.length === 0) return null;

    return (
        <div className={styles.checkoutPage}>
            <div className="container">
                <h1 className={styles.pageTitle}>Ready to Order?</h1>

                <div className={styles.checkoutLayout}>
                    {/* Left: Notice */}
                    <div>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <Mail size={20} />
                                Online Checkout Coming Soon
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                                We&apos;re in the process of setting up our secure online payment system.
                                In the meantime, please reach out to us directly and we&apos;ll walk you
                                through completing your order — every piece is handcrafted to order anyway,
                                so we love talking with our customers.
                            </p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-xl)' }}>
                                Include the items from your cart listed on the right and we&apos;ll get
                                back to you with availability, sizing, and payment options.
                            </p>
                            <Link href="/contact" className={styles.payBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', justifyContent: 'center' }}>
                                <Mail size={16} />
                                Contact Us to Complete Your Order
                            </Link>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Your Items</h2>

                        <div className={styles.summaryItems}>
                            {items.map((item) => (
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

                        <div className={styles.summaryTotal}>
                            <span>Estimated Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className={styles.secureNote}>
                            <ShoppingBag size={14} />
                            Handcrafted to order in Nebraska
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
