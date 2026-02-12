'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, User, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
    const { itemCount, openCart } = useCart();

    return (
        <header className={styles.header} id="site-header">
            <Link href="/" className={styles.logo}>
                Wizard Of Light
            </Link>

            <nav className={styles.nav} id="main-nav">
                <Link href="/shop" className={styles.navLink}>
                    Shop
                </Link>
                <Link href="/events" className={styles.navLink}>
                    Events
                </Link>
                <Link href="/journal" className={styles.navLink}>
                    Journal
                </Link>
                <Link href="/about" className={styles.navLink}>
                    About
                </Link>
                <Link href="/contact" className={styles.navLink}>
                    Contact
                </Link>
            </nav>

            <div className={styles.actions}>
                <Link href="/account/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                    <Heart size={20} />
                </Link>
                <button
                    className={styles.iconBtn}
                    aria-label="Shopping Cart"
                    onClick={openCart}
                >
                    <ShoppingBag size={20} />
                    {itemCount > 0 && (
                        <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
                    )}
                </button>
                <Link href="/account" className={styles.iconBtn} aria-label="Account">
                    <User size={20} />
                </Link>
                <button className={`${styles.iconBtn} ${styles.mobileMenuBtn}`} aria-label="Open Menu">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
