'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Plus, Trash2, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import styles from './ProductForm.module.css';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        price: initialData?.product_variants?.[0]?.price ? initialData.product_variants[0].price / 100 : 0,
        stock: initialData?.product_variants?.[0]?.stock_count || 0,
        is_nsfw: initialData?.is_nsfw || false,
        is_published: initialData?.is_published || false,
    });

    const [variants, setVariants] = useState<any[]>(initialData?.product_variants || []);
    const [images, setImages] = useState<any[]>(initialData?.product_images || []);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Slug generation
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: !isEditing ? generateSlug(name) : prev.slug
        }));
    };

    // Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setImages(prev => [...prev, { url: publicUrl, is_primary: prev.length === 0 }]);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const setPrimaryImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === index })));
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const productData = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                is_nsfw: formData.is_nsfw,
                is_published: formData.is_published,
                // Default variant price/stock used for simple products, 
                // but we should ideally manage variants separately.
                // For MVP, we'll assume creating at least one default variant if none exist.
            };

            let productId = initialData?.id;

            if (isEditing) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // Handle Images
            // Delete existing relations first (simple approach) or upsert matches
            if (isEditing) {
                await supabase.from('product_images').delete().eq('product_id', productId);
            }

            if (images.length > 0) {
                const imageData = images.map((img, idx) => ({
                    product_id: productId,
                    url: img.url,
                    is_primary: img.is_primary,
                    sort_order: idx,
                }));
                await supabase.from('product_images').insert(imageData);
            }

            // Handle Variants (Simplified: 1 Default Variant for MVP created via Form)
            // If user wants full variant management, we'd need a complex UI.
            // For now, we update/create a default variant based on the main price/stock inputs.

            const defaultVariantData = {
                product_id: productId,
                name: 'Default',
                sku: `${formData.slug.toUpperCase().slice(0, 10)}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                price: Math.round(formData.price * 100), // convert to cents
                stock_count: parseInt(formData.stock as any),
                options: {},
                sort_order: 0
            };

            // Check if default variant exists
            if (isEditing && variants.length > 0) {
                await supabase
                    .from('product_variants')
                    .update({
                        price: defaultVariantData.price,
                        stock_count: defaultVariantData.stock_count
                    })
                    .eq('id', variants[0].id);
            } else {
                await supabase.from('product_variants').insert(defaultVariantData);
            }

            router.push('/admin/products');
            router.refresh();

        } catch (error: any) {
            console.error('Error saving product:', error);
            setErrors({ submit: error.message || 'Failed to save product' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formHeader}>
                <h1 className={styles.title}>{isEditing ? 'Edit Product' : 'Check Inventory'}</h1>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.saveBtn}
                    >
                        {loading && <Loader2 className={styles.spinner} size={16} />}
                        Save Product
                    </button>
                </div>
            </div>

            {errors.submit && <div className={styles.errorBanner}>{errors.submit}</div>}

            <div className={styles.grid}>
                <div className={styles.mainColumn}>
                    <div className={styles.card}>
                        <div className={styles.field}>
                            <label>Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={5}
                                className={styles.textarea}
                            />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3>Images</h3>
                        <div className={styles.imageGrid}>
                            {images.map((img, idx) => (
                                <div key={idx} className={styles.imagePreview}>
                                    <img src={img.url} alt="Product" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className={styles.removeImageBtn}
                                    >
                                        <X size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryImage(idx)}
                                        className={`${styles.primaryBtn} ${img.is_primary ? styles.activePrimary : ''}`}
                                    >
                                        {img.is_primary ? 'Main' : 'Set Main'}
                                    </button>
                                </div>
                            ))}
                            <div
                                className={styles.uploadZone}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {uploading ? (
                                    <Loader2 className={styles.spinner} />
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span>Add Image</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sideColumn}>
                    <div className={styles.card}>
                        <h3>Pricing & Stock</h3>
                        <div className={styles.field}>
                            <label>Price ($)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                required
                                min="0"
                                step="0.01"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Stock Count</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                                required
                                min="0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3>Settings</h3>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={formData.is_published}
                                onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                            />
                            Published
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={formData.is_nsfw}
                                onChange={e => setFormData(prev => ({ ...prev, is_nsfw: e.target.checked }))}
                            />
                            NSFW (18+)
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}
