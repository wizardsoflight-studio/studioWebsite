import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer} id="site-footer">
            <div className={styles.footerContent}>
                <div className={styles.brand}>
                    <h3>Wizard Of Light</h3>
                    <p>
                        Handcrafted leather goods for cosplay, everyday carry, and the
                        adventurous spirit. Every piece tells a story.
                    </p>
                </div>

                <div className={styles.column}>
                    <h4>Shop</h4>
                    <ul>
                        <li><Link href="/shop">All Products</Link></li>
                        <li><Link href="/shop?category=leather-goods">Leather Goods</Link></li>
                        <li><Link href="/shop?category=cosplay">Cosplay</Link></li>
                        <li><Link href="/shop?category=custom">Custom Orders</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4>Studio</h4>
                    <ul>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/events">Events</Link></li>
                        <li><Link href="/journal">Journal</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4>Account</h4>
                    <ul>
                        <li><Link href="/account">My Account</Link></li>
                        <li><Link href="/account/orders">Order History</Link></li>
                        <li><Link href="/account/wishlist">Wishlist</Link></li>
                        <li><Link href="/account/preferences">Preferences</Link></li>
                    </ul>
                </div>


            </div>

            <div className={styles.footerBottom}>
                <p className={styles.copyright} style={{ margin: 0 }}>
                    © {currentYear} Wizard Of Light. All rights reserved.
                </p>
                
                <div className={styles.copyright} style={{ display: 'flex', gap: '1rem', opacity: 0.8, margin: 0 }}>
                    <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Use</Link>
                </div>

                <p className={styles.copyright} style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
                    Website developed by <a href="https://lumenworks.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>lumenworks.app</a> (LumenWorks LLC, Nebraska)
                </p>
                <div className={styles.socials}>
                    {/* Social links will be added when URLs are provided */}
                </div>
            </div>
        </footer>
    );
}
