import { createServiceClient } from '@/lib/supabase/service';
import NsfwShopClient from './NsfwShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '18+ Collection',
    description: 'Adult handcrafted leather goods — age verification required.',
};

export default async function NsfwShopPage() {
    // Use service role to bypass RLS — age verification happens client-side
    const supabase = createServiceClient();

    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      product_variants(id, price, stock_count),
      product_images(url, alt, is_primary)
    `)
        .eq('is_published', true)
        .eq('is_nsfw', true);

    const productsWithPricing = (products || []).map((product) => {
        const variants = product.product_variants || [];
        const minPrice = variants.length > 0
            ? Math.min(...variants.map((v: { price: number }) => v.price))
            : 0;
        const totalStock = variants.reduce(
            (sum: number, v: { stock_count: number }) => sum + v.stock_count,
            0
        );
        const hasMultiplePrices = variants.length > 1 &&
            new Set(variants.map((v: { price: number }) => v.price)).size > 1;
        const images = product.product_images || [];
        const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0];

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            short_description: product.short_description,
            description: product.description,
            is_nsfw: product.is_nsfw,
            is_custom_order: product.is_custom_order,
            minPrice,
            totalStock,
            hasMultiplePrices,
            primaryImage: primaryImage || null,
        };
    });

    return <NsfwShopClient products={productsWithPricing} />;
}
