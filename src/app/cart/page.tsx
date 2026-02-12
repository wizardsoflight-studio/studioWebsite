'use client';

import Link from 'next/link';
import { ShoppingBag, Package, Shield, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import styles from './cart.module.css';

export default function CartPage() {
    const { items, subtotal, removeItem, updateQuantity } = useCart();

    if (items.length === 0) {
        return (
            <div className={styles.cartPage}>
                <div className="container">
                    <div className={styles.emptyCart}>
                        <ShoppingBag size={64} />
                        <h2>Your Cart is Empty</h2>
                        <p>Looks like you haven&apos;t found your next treasure yet.</p>
                        <Link href="/shop" className={styles.shopBtn}>
                            <ArrowRight size={18} />
                            Explore the Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartPage}>
            <div className="container">
                <h1 className={styles.pageTitle}>Your Cart</h1>

                <div className={styles.cartLayout}>
                    {/* Cart Items */}
                    <div className={styles.cartItems}>
                        {items.map((item) => (
                            <div key={item.variantId} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} />
                                    ) : (
                                        <Package size={32} className={styles.itemImagePlaceholder} />
                                    )}
                                </div>

                                <div className={styles.itemInfo}>
                                    <div className={styles.itemName}>
                                        <Link
                                            href={`/shop/${item.slug}`}
                                            className={styles.itemNameLink}
                                        >
                                            {item.productName}
                                        </Link>
                                    </div>
                                    <div className={styles.itemVariant}>{item.variantName}</div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeItem(item.variantId)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className={styles.itemQuantity}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() =>
                                            updateQuantity(item.variantId, item.quantity - 1)
                                        }
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className={styles.qtyValue}>{item.quantity}</span>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() =>
                                            updateQuantity(item.variantId, item.quantity + 1)
                                        }
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className={styles.itemPriceCol}>
                                    <div className={styles.itemPrice}>
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                    {item.quantity > 1 && (
                                        <div className={styles.itemUnitPrice}>
                                            {formatPrice(item.price)} each
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Proceed to Checkout
                        </Link>

                        <Link href="/shop" className={styles.continueLink}>
                            ← Continue Shopping
                        </Link>

                        <div className={styles.secureNote}>
                            <Shield size={14} />
                            Secure checkout powered by Stripe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
