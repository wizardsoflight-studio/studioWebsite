'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import styles from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Use window.location.href to force a hard refresh and ensure middleware/cookies sync
        window.location.href = '/account';
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

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.authLogo}>Wizard Of Light</div>
                    <h1 className={styles.authTitle}>Welcome Back</h1>
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
                    <span className={styles.dividerText}>or sign in with email</span>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            className={styles.formInput}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            className={styles.formInput}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div />
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup">Create one</Link>
                </div>
            </div>
        </div>
    );
}
