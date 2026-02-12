'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
            // Handle rate limit specifically if possible, but message usually says "Too many requests"
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.authLogo}>Wizard Of Light</div>
                    <h1 className={styles.authTitle}>Reset Password</h1>
                </div>

                {success ? (
                    <div className={styles.successMsg}>
                        <p>Check your email for the password reset link.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Can't find it? Check your spam folder.
                        </p>
                    </div>
                ) : (
                    <>
                        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {error && <div className={styles.errorMsg}>{error}</div>}

                        <form onSubmit={handleReset}>
                            <div className={styles.formGroup}>
                                <label htmlFor="reset-email">Email</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    className={styles.formInput}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                )}

                <div className={styles.authFooter}>
                    Remember your password?{' '}
                    <Link href="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
