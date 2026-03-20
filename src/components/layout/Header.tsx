'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.css';

export default function Header() {
    const { itemCount, openCart } = useCart();
    const { user, role, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setShowAccountDropdown(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showAccountDropdown && !target.closest(`.${styles.accountWrapper}`)) {
                setShowAccountDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAccountDropdown]);

    const closeMenu = () => setIsMenuOpen(false);

    const handleDropdownClick = (callback: () => void) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            callback();
        };
    };

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
                    {/* Admin Link - Only for admins */}
                    {role === 'admin' && (
                        <Link href="/admin" className={styles.adminLink}>
                            <Shield size={18} />
                            <span>Admin</span>
                        </Link>
                    )}

                    {/* Staff Link - Only for staff */}
                    {role === 'staff' && (
                        <Link href="/admin/staff" className={styles.adminLink}>
                            <Shield size={18} />
                            <span>Staff</span>
                        </Link>
                    )}

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

                    {user ? (
                        <div className={styles.accountWrapper}>
                            <button
                                className={styles.accountBtn}
                                onClick={() => setShowAccountDropdown(prev => !prev)}
                                aria-expanded={showAccountDropdown}
                                aria-label="Account menu"
                            >
                                <div className={styles.accountAvatar}>
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className={styles.accountName}>
                                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account'}
                                </span>
                                <ChevronDown size={16} className={`${styles.accountChevron} ${showAccountDropdown ? styles.chevronUp : ''}`} />
                            </button>

                            {showAccountDropdown && (
                                <div
                                    className={styles.accountDropdown}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link
                                        href="/account"
                                        className={styles.dropdownItem}
                                        onClick={handleDropdownClick(() => setShowAccountDropdown(false))}
                                    >
                                        <User size={18} />
                                        My Account
                                    </Link>
                                    <Link
                                        href="/account/orders"
                                        className={styles.dropdownItem}
                                        onClick={handleDropdownClick(() => setShowAccountDropdown(false))}
                                    >
                                        <ShoppingBag size={18} />
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/account/wishlist"
                                        className={styles.dropdownItem}
                                        onClick={handleDropdownClick(() => setShowAccountDropdown(false))}
                                    >
                                        <Heart size={18} />
                                        Wishlist
                                    </Link>
                                    <div className={styles.dropdownDivider} />
                                    <button
                                        type="button"
                                        className={styles.dropdownItem}
                                        onClick={async () => {
                                            setShowAccountDropdown(false);
                                            await signOut();
                                        }}
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            <User size={20} />
                            <span>Sign In</span>
                        </Link>
                    )}

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
