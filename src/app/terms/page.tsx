import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use',
    description: 'Terms of Use for Wizard Of Light',
};

export default function TermsOfUsePage() {
    return (
        <div style={{ padding: 'var(--space-3xl) 0', background: 'var(--color-bg-primary)', minHeight: '60vh' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-xl)', color: 'var(--color-text-primary)' }}>
                    Terms of Use
                </h1>
                
                <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        1. Agreement to Terms
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Wizard Of Light ("Company", "we", "us", or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        2. 18+ Age Restriction
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Portions of this website contain content intended for adult individuals aged 18 years and older. By accessing the 18+ Collection or any age-restricted products, you represent and warrant that you are at least 18 years of age and that accessing such content is legal in your jurisdiction. We reserve the right to request age verification for any order.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        3. Custom Orders & Handcrafted Nature
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Please note that all products are handcrafted. Slight variations in color, texture, and finish are inherent characteristics of real leather and the artisanal process. These variations are not considered defects. Custom orders are made to your specifications and are generally non-refundable unless defective.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        4. Intellectual Property Rights
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        5. User Representations
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you will not access the Site through automated or non-human means; (4) you will not use the Site for any illegal or unauthorized purpose; and (5) your use of the Site will not violate any applicable law or regulation.
                    </p>

                    <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                        6. Modifications and Interruptions
                    </h2>
                    <p style={{ marginBottom: 'var(--space-md)' }}>
                        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                    </p>

                    <p style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                        If you have any questions or concerns regarding our terms, please contact us.
                    </p>
                </div>
            </div>
        </div>
    );
}
