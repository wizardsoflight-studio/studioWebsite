'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './AgeGate.module.css';

const AGE_GATE_KEY = 'wol_age_verified';

interface AgeGateProps {
    /** If true, always shows the gate (for NSFW product pages) */
    required?: boolean;
}

export default function AgeGate({ required = false }: AgeGateProps) {
    const [showGate, setShowGate] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user has already verified age
        const verified = localStorage.getItem(AGE_GATE_KEY);
        if (!verified && required) {
            setShowGate(true);
            // Prevent scrolling while modal is open
            document.body.style.overflow = 'hidden';
        }
    }, [required]);

    const handleConfirm = () => {
        localStorage.setItem(AGE_GATE_KEY, 'true');
        setShowGate(false);
        document.body.style.overflow = '';
    };

    const handleDecline = () => {
        // Redirect to home page
        document.body.style.overflow = '';
        router.push('/');
    };

    if (!showGate) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
            <div className={styles.modal}>
                <div className={styles.icon}>
                    <ShieldAlert size={32} />
                </div>
                <h2 className={styles.title} id="age-gate-title">
                    Age Verification Required
                </h2>
                <p className={styles.description}>
                    This section contains content intended for adults (18+). By clicking
                    &quot;I&apos;m 18 or Older&quot;, you confirm that you are of legal age to
                    view this content.
                </p>
                <div className={styles.actions}>
                    <button className={styles.confirmBtn} onClick={handleConfirm}>
                        I&apos;m 18 or Older
                    </button>
                    <button className={styles.declineBtn} onClick={handleDecline}>
                        Take Me Back
                    </button>
                </div>
                <p className={styles.disclaimer}>
                    Your preference will be remembered for this browser session.
                </p>
            </div>
        </div>
    );
}

/**
 * Hook to check if the user has verified their age
 */
export function useAgeVerified(): boolean {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        setVerified(localStorage.getItem(AGE_GATE_KEY) === 'true');
    }, []);

    return verified;
}
