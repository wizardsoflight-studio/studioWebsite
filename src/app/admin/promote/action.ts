'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function promoteUser(formData: FormData) {
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
    const newRole = formData.get('role') as 'staff' | 'admin';

    // Use the RPC function to assign role
    const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: userId,
        new_role: newRole,
    });

    if (error) {
        console.error('Failed to promote user:', error);
        return { error: error.message };
    }

    redirect('/admin');
}
