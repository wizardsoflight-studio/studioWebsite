'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
    const {
        items,
        itemCount,
        subtotal,
        removeItem,
        updateQuantity,
        isOpen,
        closeCart,
    } = useCart();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeCart();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeCart]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
                role="dialog"
                aria-label="Shopping cart"
            >
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>
                        Cart
                        {itemCount > 0 && (
                            <span className={styles.itemCount}>({itemCount})</span>
                        )}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={closeCart}
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.drawerBody}>
                    {items.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <ShoppingBag size={48} />
                            <h3>Your cart is empty</h3>
                            <p>Looks like you haven&apos;t added anything yet.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.variantId} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} />
                                    ) : (
                                        <Package size={24} className={styles.itemImagePlaceholder} />
                                    )}
                                </div>

                                <div className={styles.itemDetails}>
                                    <div className={styles.itemName}>{item.productName}</div>
                                    <div className={styles.itemVariant}>{item.variantName}</div>
                                    <div className={styles.itemQuantity}>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span className={styles.qtyValue}>{item.quantity}</span>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemPrice}>
                                    <div className={styles.itemPriceValue}>
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeItem(item.variantId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.drawerFooter}>
                        <div className={styles.subtotalRow}>
                            <span className={styles.subtotalLabel}>Subtotal</span>
                            <span className={styles.subtotalValue}>{formatPrice(subtotal)}</span>
                        </div>
                        <Link
                            href="/cart"
                            className={styles.checkoutBtn}
                            onClick={closeCart}
                        >
                            View Cart & Checkout
                        </Link>
                        <button className={styles.continueShopping} onClick={closeCart}>
                            Continue Shopping
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
