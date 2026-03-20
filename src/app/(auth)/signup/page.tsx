'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
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

    if (success) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginHero}>
                    <div className={styles.loginHeroContent}>
                        <Sparkles className={styles.heroIcon} />
                        <h1 className={styles.heroTitle}>Check Your Email</h1>
                        <p className={styles.heroSubtitle}>
                            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        </p>
                    </div>
                </div>
                <div className={styles.loginCard} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className={styles.successMsg} style={{ marginBottom: '2rem' }}>
                        Click the secure link in your email to activate your account.
                    </div>
                    <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginHero}>
                <div className={styles.loginHeroContent}>
                    <Sparkles className={styles.heroIcon} />
                    <h1 className={styles.heroTitle}>Join the Studio</h1>
                    <p className={styles.heroSubtitle}>
                        Create an account to secure your orders, access exclusive collections, and manage preferences.
                    </p>
                </div>
            </div>

            <div className={styles.loginCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Sign Up</h2>
                    <p className={styles.cardSubtitle}>Enter your details to create an account</p>
                </div>

                {/* Social Login Temporarily Disabled */}
                {/*
                <div className={styles.socialButtons}>
                    <button className={styles.socialBtn} onClick={() => handleSocialLogin('google')} type="button">
                        Google
                    </button>
                    <button className={styles.socialBtn} onClick={() => handleSocialLogin('discord')} type="button">
                        Discord
                    </button>
                </div>

                <div className={styles.divider}>
                    <span className={styles.dividerText}>or sign up with email</span>
                </div>
                */}

                {error && (
                    <div className={styles.errorMsg}>
                        <svg className={styles.errorIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="signup-name" className={styles.inputLabel}>
                            <UserIcon size={18} />
                            Full Name
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            className={styles.inputField}
                            placeholder="Wanderer"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="signup-email" className={styles.inputLabel}>
                            <Mail size={18} />
                            Email Address
                        </label>
                        <input
                            id="signup-email"
                            type="email"
                            className={styles.inputField}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="signup-password" className={styles.inputLabel}>
                            <Lock size={18} />
                            Password
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            className={styles.inputField}
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        {/* Empty spacer to align with login page format */}
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.loadingSpinner}>Creating Account...</span>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>Already have an account?</p>
                    <Link href="/login" className={styles.signupLink}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
