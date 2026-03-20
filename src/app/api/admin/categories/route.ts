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

    const allowed = ['admin', 'staff'];
    if (!profile || !allowed.includes(profile.role)) return null;

    return { user, role: profile.role };
}

/**
 * GET /api/admin/categories
 * Returns all categories including hidden ones.
 */
export async function GET() {
    const db = createServiceClient();
    const { data, error } = await db
        .from('categories')
        .select('*, product_categories(product_id)')
        .order('sort_order');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data });
}

/**
 * POST /api/admin/categories
 * Create a new category.
 */
export async function POST(request: NextRequest) {
    const admin = await requireManager();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, slug, description, is_nsfw, is_visible, sort_order } = body;

    if (!name || !slug) {
        return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const db = createServiceClient();
    const { data, error } = await db
        .from('categories')
        .insert({
            name: name.trim(),
            slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: description || null,
            is_nsfw: Boolean(is_nsfw),
            is_visible: is_visible !== false,
            sort_order: parseInt(sort_order) || 0,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
}
