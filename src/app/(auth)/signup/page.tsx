'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import styles from '../auth.module.css';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    const handleSocialLogin = async (provider: 'google' | 'discord') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) setError(error.message);
    };

    if (success) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <div className={styles.authLogo}>Wizard Of Light</div>
                        <h1 className={styles.authTitle}>Check Your Email</h1>
                    </div>
                    <div className={styles.successMsg}>
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Click the link to activate your account.
                    </div>
                    <div className={styles.authFooter}>
                        <Link href="/login">Back to Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.authLogo}>Wizard Of Light</div>
                    <h1 className={styles.authTitle}>Create Your Account</h1>
                </div>

                {/* Social Login */}
                <div className={styles.socialButtons}>
                    <button
                        className={styles.socialBtn}
                        onClick={() => handleSocialLogin('google')}
                        type="button"
                    >
                        <span className={styles.socialIcon}>G</span>
                        Continue with Google
                    </button>
                    <button
                        className={styles.socialBtn}
                        onClick={() => handleSocialLogin('discord')}
                        type="button"
                    >
                        <span className={styles.socialIcon}>D</span>
                        Continue with Discord
                    </button>
                </div>

                <div className={styles.divider}>
                    <span className={styles.dividerText}>or sign up with email</span>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleSignup}>
                    <div className={styles.formGroup}>
                        <label htmlFor="signup-name">Full Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            className={styles.formInput}
                            placeholder="Bryan Leather"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            className={styles.formInput}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            className={styles.formInput}
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    Already have an account?{' '}
                    <Link href="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
