import Link from 'next/link';
import { Hammer, Sparkles, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* ---- Hero Section ---- */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Where <span className={styles.heroTitleAccent}>Craft</span> Meets
            <br />
            Every Desire
          </h1>
          <p className={styles.heroSubtitle}>
            Wizard Of Light is a Nebraska-based leather studio creating premium
            handcrafted goods — from everyday carry and armor to an exclusive
            18+ collection. Every piece cut, stitched, and finished by hand.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/shop" className={styles.btnPrimary}>
              Browse the Shop
            </Link>
            <Link href="/shop/nsfw" className={styles.btnSecondary}>
              18+ Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Features Section ---- */}
      <section className={styles.features} id="features">
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Why <span className={styles.sectionTitleAccent}>Wizard Of Light</span>
          </h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Hammer size={28} />
              </div>
              <h3>Built by Hand</h3>
              <p>
                Every piece is hand-cut, hand-stitched, and hand-finished from
                premium full-grain leather. Genuine craft in every seam.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Sparkles size={28} />
              </div>
              <h3>Your Vision, Realized</h3>
              <p>
                From convention armor to intimate accessories — if you can
                imagine it, we can build it. Custom commissions always open.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={28} />
              </div>
              <h3>Quality That Lasts</h3>
              <p>
                Premium materials, traditional techniques, and obsessive
                attention to detail. Made to be used, enjoyed, and passed on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className={styles.ctaBanner} id="cta-banner">
        <h2 className={styles.sectionTitle}>
          Something <span className={styles.sectionTitleAccent}>Unique</span> in Mind?
        </h2>
        <p>
          Whether it&apos;s a custom belt, armor for a convention, or something
          from the 18+ collection — let&apos;s talk about what you&apos;re looking for.
        </p>
        <Link href="/contact" className={styles.btnPrimary} style={{ position: 'relative' }}>
          Start a Conversation
        </Link>
      </section>
    </>
  );
}
