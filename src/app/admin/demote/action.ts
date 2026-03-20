'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function demoteUser(formData: FormData) {
    const supabase = await createClient();
    
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const userId = formData.get('userId') as string;

    // Use the RPC function to remove role
    const { error } = await supabase.rpc('remove_user_role', {
        target_user_id: userId,
    });

    if (error) {
        console.error('Failed to demote user:', error);
        return { error: error.message };
    }

    redirect('/admin');
}
