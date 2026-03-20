'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Persists 18+ consent to the authenticated user's profile.
 * Called after the user confirms their age in the AgeGate.
 */
export async function enableNsfw(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Guest users — handled via localStorage client-side
        return { success: false, error: 'Not logged in' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ nsfw_enabled: true })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to enable NSFW:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/shop/nsfw');
    return { success: true };
}

/**
 * Admin action to toggle nsfw_enabled on any user profile.
 */
export async function toggleUserNsfw(
    targetUserId: string,
    enabled: boolean
): Promise<void> {
    const supabase = await createClient();

    // Verify caller is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ nsfw_enabled: enabled })
        .eq('id', targetUserId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/customers');
}
