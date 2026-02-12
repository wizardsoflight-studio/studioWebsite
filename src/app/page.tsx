import Link from 'next/link';
import { Hammer, Sparkles, Shield } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* ---- Hero Section ---- */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Crafted in <span className={styles.heroTitleAccent}>Leather</span>,
            <br />
            Born from Light
          </h1>
          <p className={styles.heroSubtitle}>
            Handcrafted leather goods for cosplay, everyday carry, and the
            adventurous spirit. Every piece tells a story.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/shop" className={styles.btnPrimary}>
              Explore the Shop
            </Link>
            <Link href="/about" className={styles.btnSecondary}>
              Our Story
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
              <h3>Handcrafted Quality</h3>
              <p>
                Every piece is cut, stitched, and finished by hand using
                premium full-grain leather.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Sparkles size={28} />
              </div>
              <h3>Custom Creations</h3>
              <p>
                From cosplay armor to bespoke accessories — bring your vision
                to life with a custom order.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Shield size={28} />
              </div>
              <h3>Built to Last</h3>
              <p>
                Premium materials and traditional techniques ensure every
                piece ages beautifully and lasts a lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className={styles.ctaBanner} id="cta-banner">
        <h2 className={styles.sectionTitle}>
          Ready to Commission Your <span className={styles.sectionTitleAccent}>Masterpiece</span>?
        </h2>
        <p>
          Whether it&apos;s cosplay armor, a custom belt, or something uniquely
          yours — let&apos;s create it together.
        </p>
        <Link href="/contact" className={styles.btnPrimary} style={{ position: 'relative' }}>
          Get in Touch
        </Link>
      </section>
    </>
  );
}
