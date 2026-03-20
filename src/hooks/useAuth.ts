'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'customer' | null;

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    const [supabase] = useState(() => createClient());

    const getRole = useCallback(async (userId: string) => {
        try {
            // Direct query to profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                return 'customer' as UserRole;
            }
            return data?.role as UserRole;
        } catch (err) {
            console.error('Unexpected error fetching role:', err);
            return 'customer' as UserRole;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;

            if (session?.user) {
                setUser(session.user);
                const userRole = await getRole(session.user.id);
                setRole(userRole);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            // Handle sign out immediately
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                setLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);
                const userRole = await getRole(session.user.id);
                setRole(userRole);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [getRole]);

    return { user, role, loading };
}
