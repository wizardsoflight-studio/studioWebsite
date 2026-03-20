import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Wizard Of Light',
};

export default function PrivacyPolicyPage() {
    return (
        <div style={{ padding: 'var(--space-3xl) 0', background: 'var(--color-bg-primary)', minHeight: '60vh' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-xl)', color: 'var(--color-text-primary)' }}>
                    Privacy Policy
                </h1>
                
                <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        1. Introduction
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Welcome to Wizard Of Light. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        2. The Data We Collect About You
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Financial Data</strong> includes payment card details (processed securely by our payment providers; we do not store full card details on our servers).</li>
                        <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                    </ul>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        3. How We Use Your Personal Data
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling your order).</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        4. Data Security
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        5. Your Legal Rights
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>

                    <p style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                        If you have any questions about this privacy policy, please contact us.
                    </p>
                </div>
            </div>
        </div>
    );
}
