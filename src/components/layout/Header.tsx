'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
    const { itemCount, openCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <header className={styles.header} id="site-header">
                <Link href="/" className={styles.logo} onClick={closeMenu}>
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
                    <button
                        className={`${styles.iconBtn} ${styles.mobileMenuBtn}`}
                        aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(prev => !prev)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className={styles.mobileOverlay} onClick={closeMenu} aria-hidden="true" />
            )}

            {/* Mobile Nav Drawer */}
            <nav
                className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}
                aria-label="Mobile navigation"
            >
                <div className={styles.mobileNavLinks}>
                    <Link href="/shop" className={styles.mobileNavLink} onClick={closeMenu}>
                        Shop
                    </Link>
                    <Link href="/shop/nsfw" className={styles.mobileNavLink} onClick={closeMenu}>
                        18+ Collection
                    </Link>
                    <Link href="/events" className={styles.mobileNavLink} onClick={closeMenu}>
                        Events
                    </Link>
                    <Link href="/journal" className={styles.mobileNavLink} onClick={closeMenu}>
                        Journal
                    </Link>
                    <Link href="/about" className={styles.mobileNavLink} onClick={closeMenu}>
                        About
                    </Link>
                    <Link href="/contact" className={styles.mobileNavLink} onClick={closeMenu}>
                        Contact
                    </Link>
                </div>
                <div className={styles.mobileNavActions}>
                    <Link href="/account/wishlist" className={styles.mobileNavAction} onClick={closeMenu}>
                        <Heart size={18} />
                        Wishlist
                    </Link>
                    <Link href="/account" className={styles.mobileNavAction} onClick={closeMenu}>
                        <User size={18} />
                        Account
                    </Link>
                </div>
            </nav>
        </>
    );
}
