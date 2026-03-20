import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

async function requireManager() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const allowed = ['owner', 'manager', 'content_editor'];
    if (!profile || !allowed.includes(profile.role)) return null;

    return { user, role: profile.role };
}

/**
 * PUT /api/admin/categories/[id]
 * Update a category.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireManager();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, slug, description, is_nsfw, is_visible, sort_order } = body;

    const db = createServiceClient();
    const { data, error } = await db
        .from('categories')
        .update({
            name: name?.trim(),
            slug: slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: description ?? null,
            is_nsfw: Boolean(is_nsfw),
            is_visible: is_visible !== false,
            sort_order: parseInt(sort_order) || 0,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data });
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category. Only owners and managers can delete.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireManager();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['owner', 'manager'].includes(admin.role)) {
        return NextResponse.json({ error: 'Forbidden — only managers can delete categories' }, { status: 403 });
    }

    const { id } = await params;
    const db = createServiceClient();

    const { error } = await db.from('categories').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
