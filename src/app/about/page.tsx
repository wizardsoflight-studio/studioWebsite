import Link from 'next/link';
import { Flame, Heart, Eye, Scissors } from 'lucide-react';
import styles from './about.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About',
    description: 'The story behind Wizard Of Light — handcrafted leather by Bryan, born from passion and built to last.',
};

export default function AboutPage() {
    return (
        <div className={styles.aboutPage}>
            {/* Hero */}
            <section className={styles.aboutHero}>
                <div className="container">
                    <h1 className={styles.aboutTitle}>
                        The <span className={styles.aboutTitleAccent}>Wizard</span> Behind the Craft
                    </h1>
                    <p className={styles.aboutIntro}>
                        Every piece from Wizard Of Light begins with a vision and ends with
                        a story. What started as a passion project in a small workshop has
                        grown into a studio dedicated to creating leather goods that are as
                        unique as the people who wear them.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className={styles.storySection}>
                <div className="container">
                    <div className={styles.storyGrid}>
                        <div className={styles.aboutImageContainer}>
                            {/* Placeholder for Bryan's picture */}
                            <div className={styles.aboutImagePlaceholder}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'var(--color-bg-elevated)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Bryan's Photo</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.storyContent}>
                            <h2>
                                A Workshop Born from <span>Passion</span>
                            </h2>
                            <p>
                                Bryan discovered leathercraft through the cosplay community. What
                                started as making his own armor pieces quickly turned into a deep
                                love for the art of leather — the smell of fresh-cut hide, the
                                satisfaction of a perfect stitch line, the pride of creating
                                something that lasts.
                            </p>
                            <p>
                                Today, Wizard Of Light serves a community of cosplayers,
                                Renaissance faire enthusiasts, everyday carry aficionados, and
                                anyone who appreciates handcrafted quality. Every belt, bracer,
                                and wallet that leaves the studio carries a piece of that original
                                spark.
                            </p>
                            <p>
                                Based in Nebraska, Bryan works with premium full-grain leather
                                sourced from trusted tanneries. Each piece is hand-cut,
                                hand-stitched, and hand-finished — because the best things in
                                life are made by hand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className={styles.valuesSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>
                        What Drives <span className={styles.sectionTitleAccent}>Us</span>
                    </h2>
                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <Flame size={28} />
                            </div>
                            <h3>Passion First</h3>
                            <p>
                                Every piece is a labor of love. We don&apos;t mass-produce — we
                                craft. Each order gets the attention and care it deserves.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <Eye size={28} />
                            </div>
                            <h3>Attention to Detail</h3>
                            <p>
                                From edge finishing to stitch spacing, we obsess over the
                                details that separate good leather from great leather.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}>
                                <Heart size={28} />
                            </div>
                            <h3>Community Driven</h3>
                            <p>
                                We&apos;re part of the communities we serve. You&apos;ll find us
                                at faires, conventions, and markets — leather in hand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>
                        Let&apos;s Create Something <span className={styles.sectionTitleAccent}>Together</span>
                    </h2>
                    <p>
                        Have an idea for a custom piece? Want to collaborate on a cosplay
                        build? We&apos;d love to hear from you.
                    </p>
                    <Link href="/contact" className={styles.ctaBtn}>
                        Get in Touch
                    </Link>
                </div>
            </section>
        </div>
    );
}
