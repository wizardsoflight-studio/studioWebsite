'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function promoteUser(formData: FormData): Promise<void> {
    const supabase = await createClient();
    
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
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

    const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: userId,
        new_role: newRole,
    });

    if (error) {
        console.error('Failed to promote user:', error);
        throw new Error(error.message);
    }

    redirect('/admin/customers');
}

export async function demoteUser(formData: FormData): Promise<void> {
    const supabase = await createClient();
    
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
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

    const { error } = await supabase.rpc('remove_user_role', {
        target_user_id: userId,
    });

    if (error) {
        console.error('Failed to demote user:', error);
        throw new Error(error.message);
    }

    redirect('/admin/customers');
}
