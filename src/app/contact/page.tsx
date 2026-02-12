import { Mail, Clock, MapPin, MessageSquare, HelpCircle } from 'lucide-react';
import styles from './contact.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with Wizard Of Light — custom orders, commissions, questions, and collaboration.',
};

export default function ContactPage() {
    return (
        <div className={styles.contactPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Get in Touch</h1>
                    <p className={styles.pageSubtitle}>
                        Questions, custom orders, or just want to say hi? We&apos;d love to hear from you.
                    </p>
                </header>

                <div className={styles.contactLayout}>
                    {/* Contact Form */}
                    <div className={styles.formSection}>
                        <h2>Send a Message</h2>
                        <form
                            name="contact"
                            method="POST"
                            data-netlify="true"
                            action="/contact?success=true"
                        >
                            <input type="hidden" name="form-name" value="contact" />

                            <div className={styles.formGroup}>
                                <label htmlFor="contact-name">Name</label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contact-email">Email</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    className={styles.formInput}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contact-subject">Subject</label>
                                <select
                                    id="contact-subject"
                                    name="subject"
                                    className={`${styles.formInput} ${styles.formSelect}`}
                                    required
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="custom-order">Custom Order Inquiry</option>
                                    <option value="order-question">Existing Order Question</option>
                                    <option value="collaboration">Collaboration / Events</option>
                                    <option value="wholesale">Wholesale Inquiry</option>
                                    <option value="general">General Question</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contact-message">Message</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    className={`${styles.formInput} ${styles.formTextarea}`}
                                    placeholder="Tell us about your project, question, or idea..."
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Info Sidebar */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3>
                                <MessageSquare size={20} />
                                Studio Info
                            </h3>
                            <div className={styles.infoItem}>
                                <Mail size={16} />
                                <span>hello@wizardoflight.com</span>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={16} />
                                <span>Nebraska, USA</span>
                            </div>
                            <div className={styles.infoItem}>
                                <Clock size={16} />
                                <span>Response within 24–48 hours</span>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>
                                <HelpCircle size={20} />
                                Frequently Asked
                            </h3>
                            <div className={styles.faqList}>
                                <div className={styles.faqItem}>
                                    <h4>How long do custom orders take?</h4>
                                    <p>
                                        Most custom pieces take 2–4 weeks depending on complexity.
                                        We&apos;ll provide a timeline with your quote.
                                    </p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h4>Do you ship internationally?</h4>
                                    <p>
                                        Yes! We ship to Canada and internationally. Shipping costs
                                        are calculated at checkout.
                                    </p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h4>Can I request modifications?</h4>
                                    <p>
                                        Absolutely. Many of our products can be customized — size,
                                        color, hardware, engraving. Just ask!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
