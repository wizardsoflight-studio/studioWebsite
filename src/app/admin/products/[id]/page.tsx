import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Product — Admin',
};

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select(`
            *,
            product_variants(*),
            product_images(*)
        `)
        .eq('id', id)
        .single();

    if (!product) {
        notFound();
    }

    return <ProductForm initialData={product} isEditing={true} />;
}
