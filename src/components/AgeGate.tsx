'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { enableNsfw } from '@/app/shop/nsfw/actions';
import styles from './AgeGate.module.css';

const AGE_GATE_KEY = 'wol_age_verified';

interface AgeGateProps {
    /** If true, always shows the gate (for NSFW product pages) */
    required?: boolean;
    /** Pass true when the user's profile already has nsfw_enabled = true */
    profileVerified?: boolean;
}

function calculateAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

export default function AgeGate({ required = false, profileVerified = false }: AgeGateProps) {
    const [showGate, setShowGate] = useState(false);
    const [step, setStep] = useState<'intro' | 'dob'>('intro');
    const [dob, setDob] = useState('');
    const [dobError, setDobError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (profileVerified) return; // Already verified via profile — no gate needed
        const localVerified = localStorage.getItem(AGE_GATE_KEY) === 'true';
        if (!localVerified && required) {
            setShowGate(true);
            document.body.style.overflow = 'hidden';
        }
    }, [required, profileVerified]);

    const handleInitialConfirm = () => {
        setStep('dob');
    };

    const handleDobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDobError('');

        if (!dob) {
            setDobError('Please enter your date of birth.');
            return;
        }

        const age = calculateAge(dob);
        if (age < 18) {
            setDobError('You must be 18 or older to access this content.');
            return;
        }

        setLoading(true);
        // Always set localStorage for fast client-side checks
        localStorage.setItem(AGE_GATE_KEY, 'true');

        // If logged in, persist to profile
        const result = await enableNsfw();
        if (!result.success && result.error !== 'Not logged in') {
            console.warn('Could not persist NSFW preference:', result.error);
        }

        setShowGate(false);
        document.body.style.overflow = '';
        setLoading(false);
    };

    const handleDecline = () => {
        document.body.style.overflow = '';
        router.push('/');
    };

    if (!showGate) return null;

    // Max date = today minus 18 years (cannot select a future or under-18 DOB)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
            <div className={styles.modal}>
                <div className={styles.icon}>
                    {step === 'intro' ? <ShieldAlert size={32} /> : <Calendar size={32} />}
                </div>

                {step === 'intro' ? (
                    <>
                        <h2 className={styles.title} id="age-gate-title">
                            18+ Content
                        </h2>
                        <p className={styles.description}>
                            This section contains adult content intended for audiences aged 18 and over.
                            You must verify your age to continue.
                        </p>
                        <div className={styles.actions}>
                            <button className={styles.confirmBtn} onClick={handleInitialConfirm}>
                                I&apos;m 18 or Older — Verify Age
                            </button>
                            <button className={styles.declineBtn} onClick={handleDecline}>
                                Take Me Back
                            </button>
                        </div>
                        <p className={styles.disclaimer}>
                            By entering, you confirm you are of legal age in your jurisdiction.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className={styles.title} id="age-gate-title">
                            Confirm Your Age
                        </h2>
                        <p className={styles.description}>
                            Enter your date of birth to verify you are 18 or older.
                        </p>
                        <form onSubmit={handleDobSubmit} className={styles.dobForm}>
                            <input
                                type="date"
                                className={styles.dobInput}
                                value={dob}
                                max={maxDateStr}
                                onChange={(e) => {
                                    setDob(e.target.value);
                                    setDobError('');
                                }}
                                required
                                aria-label="Date of birth"
                            />
                            {dobError && (
                                <p className={styles.dobError}>{dobError}</p>
                            )}
                            <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    className={styles.confirmBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Confirm & Enter'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.declineBtn}
                                    onClick={handleDecline}
                                >
                                    Take Me Back
                                </button>
                            </div>
                        </form>
                        <p className={styles.disclaimer}>
                            Your age verification will be saved to your account if you&apos;re logged in.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Hook to check if the user has verified their age (client-side only)
 */
export function useAgeVerified(): boolean {
    const [verified, setVerified] = useState(false);
    useEffect(() => {
        setVerified(localStorage.getItem(AGE_GATE_KEY) === 'true');
    }, []);
    return verified;
}
