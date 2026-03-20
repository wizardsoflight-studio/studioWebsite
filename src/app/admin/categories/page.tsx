import { createServiceClient } from '@/lib/supabase/service';
import CategoryManager from './CategoryManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin — Collections',
};

export default async function AdminCategoriesPage() {
    // Use service client so admins can always see ALL categories (including hidden ones)
    const supabase = createServiceClient();

    const { data: categories } = await supabase
        .from('categories')
        .select('*, product_categories(product_id)')
        .order('sort_order');

    return <CategoryManager initialCategories={categories || []} />;
}
