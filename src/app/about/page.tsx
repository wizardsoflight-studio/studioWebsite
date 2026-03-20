import Link from 'next/link';
import Image from 'next/image';
import { Flame, Heart, Eye, Scissors } from 'lucide-react';
import styles from './about.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About',
    description: 'Wizard Of Light is a Nebraska leather studio crafting premium goods for everyday carry, armor enthusiasts, and an exclusive 18+ community — all made by hand.',
};

export default function AboutPage() {
    return (
        <div className={styles.aboutPage}>
            {/* Hero */}
            <section className={styles.aboutHero}>
                <div className="container">
                    <h1 className={styles.aboutTitle}>
                        The <span className={styles.aboutTitleAccent}>Studio</span> Behind the Craft
                    </h1>
                    <p className={styles.aboutIntro}>
                        Wizard Of Light is a Nebraska-based leather workshop where every
                        single piece is made by hand. From premium everyday carry goods to
                        handcrafted armor and an exclusive 18+ collection — this is leather
                        work done with intention, craft, and no compromises.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className={styles.storySection}>
                <div className="container">
                    <div className={styles.storyGrid}>
                        <div className={styles.storyImageWrapper} style={{ position: 'relative' }}>
                            <Image
                                src="/images/staff/BryanNWright.jpg"
                                alt="Bryan N Wright, Owner of Wizard Of Light"
                                fill
                                style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                        <div className={styles.storyContent}>
                            <h2>
                                A Studio Built on <span>Craft</span>
                            </h2>
                            <p>
                                Bryan built Wizard Of Light from a genuine love of leather —
                                the smell of fresh-cut hide, the satisfaction of a perfect
                                stitch line, the pride of sending something out into the world
                                that will last for years.
                            </p>
                            <p>
                                WOL serves a broad community: everyday carry enthusiasts who
                                want something better than mass-produced, armor builders and
                                faire-goers, and adults looking for premium leather goods in
                                the 18+ space — all with the same uncompromising standard of
                                craft.
                            </p>
                            <p>
                                Every piece leaves the Nebraska studio hand-cut,
                                hand-stitched, and hand-finished. Premium full-grain leather
                                from trusted tanneries. Traditional techniques. Zero shortcuts.
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
                            <h3>Community First</h3>
                            <p>
                                WOL exists inside the communities it serves — faires,
                                conventions, and kink spaces alike. We show up, we listen,
                                and we build what our customers actually want.
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
                        Whether it&apos;s everyday carry, armor, or something from the 18+ collection
                        — custom work is always welcome. Reach out and let&apos;s build something.
                    </p>
                    <Link href="/contact" className={styles.ctaBtn}>
                        Get in Touch
                    </Link>
                </div>
            </section>
        </div>
    );
}
