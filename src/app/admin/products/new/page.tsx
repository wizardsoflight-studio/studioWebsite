import ProductForm from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add Product — Admin',
};

export default function NewProductPage() {
    return <ProductForm />;
}
