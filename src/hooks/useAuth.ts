'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'customer' | null;

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const getRole = useCallback(async (userId: string) => {
        // Use RPC function for faster role lookup
        const { data, error } = await supabase.rpc('get_user_role');
        if (error || !data) {
            // Fallback to direct query
            const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            return profileData?.role as UserRole;
        }
        return data as UserRole;
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

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    }, []);

    return { user, role, loading, signOut };
}
