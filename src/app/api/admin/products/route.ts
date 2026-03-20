import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(request: NextRequest) {
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
 * POST /api/admin/products
 * Create a new product with variants, images, and category assignments.
 */
export async function POST(request: NextRequest) {
    const admin = await requireAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, slug, description, short_description, is_nsfw, is_published, is_custom_order, price, stock, images, category_ids } = body;

    if (!name || !slug) {
        return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const db = createServiceClient();

    try {
        // 1. Insert the product
        const { data: product, error: productError } = await db
            .from('products')
            .insert({
                name: name.trim(),
                slug: slug.trim(),
                description: description || '',
                short_description: short_description || null,
                is_nsfw: Boolean(is_nsfw),
                is_published: Boolean(is_published),
                is_custom_order: Boolean(is_custom_order),
            })
            .select()
            .single();

        if (productError) throw productError;

        const productId = product.id;

        // 2. Insert default variant
        const priceInCents = Math.round((parseFloat(price) || 0) * 100);
        const stockCount = parseInt(stock) || 0;

        const { error: variantError } = await db
            .from('product_variants')
            .insert({
                product_id: productId,
                name: 'Default',
                sku: `${slug.toUpperCase().slice(0, 10)}-${Date.now().toString(36).toUpperCase()}`,
                price: priceInCents,
                stock_count: stockCount,
                options: {},
                sort_order: 0,
            });

        if (variantError) throw variantError;

        // 3. Insert images
        if (images && images.length > 0) {
            const imageData = (images as { url: string; is_primary?: boolean }[]).map((img, idx) => ({
                product_id: productId,
                url: img.url,
                is_primary: idx === 0 ? true : Boolean(img.is_primary),
                sort_order: idx,
                alt: name,
            }));

            const { error: imagesError } = await db
                .from('product_images')
                .insert(imageData);

            if (imagesError) throw imagesError;
        }

        // 4. Assign categories
        if (category_ids && category_ids.length > 0) {
            const catData = (category_ids as string[]).map((catId) => ({
                product_id: productId,
                category_id: catId,
            }));

            const { error: catError } = await db
                .from('product_categories')
                .insert(catData);

            if (catError) throw catError;
        }

        return NextResponse.json({ product }, { status: 201 });

    } catch (err: any) {
        console.error('Product creation error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
    }
}
