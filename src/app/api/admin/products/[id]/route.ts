import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
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
 * PUT /api/admin/products/[id]
 * Update an existing product.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
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

    const { name, slug, description, short_description, is_nsfw, is_published, is_custom_order, price, stock, images, category_ids } = body;

    const db = createServiceClient();

    try {
        // 1. Update product fields
        const { error: productError } = await db
            .from('products')
            .update({
                name: name?.trim(),
                slug: slug?.trim(),
                description: description ?? '',
                short_description: short_description ?? null,
                is_nsfw: Boolean(is_nsfw),
                is_published: Boolean(is_published),
                is_custom_order: Boolean(is_custom_order),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (productError) throw productError;

        // 2. Update the first variant price/stock
        const priceInCents = Math.round((parseFloat(price) || 0) * 100);
        const stockCount = parseInt(stock) || 0;

        const { data: existingVariants } = await db
            .from('product_variants')
            .select('id')
            .eq('product_id', id)
            .order('sort_order')
            .limit(1);

        if (existingVariants && existingVariants.length > 0) {
            await db
                .from('product_variants')
                .update({ price: priceInCents, stock_count: stockCount })
                .eq('id', existingVariants[0].id);
        } else {
            // Create a default variant if none exist
            await db.from('product_variants').insert({
                product_id: id,
                name: 'Default',
                sku: `${(slug || id).toUpperCase().slice(0, 10)}-${Date.now().toString(36).toUpperCase()}`,
                price: priceInCents,
                stock_count: stockCount,
                options: {},
                sort_order: 0,
            });
        }

        // 3. Replace images
        if (images !== undefined) {
            await db.from('product_images').delete().eq('product_id', id);

            if (images.length > 0) {
                const imageData = (images as { url: string; is_primary?: boolean }[]).map((img, idx) => ({
                    product_id: id,
                    url: img.url,
                    is_primary: idx === 0 ? true : Boolean(img.is_primary),
                    sort_order: idx,
                    alt: name,
                }));
                await db.from('product_images').insert(imageData);
            }
        }

        // 4. Replace category assignments
        if (category_ids !== undefined) {
            await db.from('product_categories').delete().eq('product_id', id);

            if (category_ids.length > 0) {
                const catData = (category_ids as string[]).map((catId) => ({
                    product_id: id,
                    category_id: catId,
                }));
                await db.from('product_categories').insert(catData);
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Product update error:', err);
        return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product. Cascades to variants, images, and categories.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner/manager can delete products
    if (!['owner', 'manager'].includes(admin.role)) {
        return NextResponse.json({ error: 'Forbidden — only managers can delete products' }, { status: 403 });
    }

    const { id } = await params;
    const db = createServiceClient();

    const { error } = await db.from('products').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
