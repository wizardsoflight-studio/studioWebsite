'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Loader2, Star } from 'lucide-react';
import styles from './ProductForm.module.css';

interface Category {
    id: string;
    name: string;
    is_nsfw: boolean;
    is_visible: boolean;
}

interface ProductImage {
    url: string;
    is_primary: boolean;
}

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        short_description: initialData?.short_description || '',
        price: initialData?.product_variants?.[0]?.price
            ? (initialData.product_variants[0].price / 100).toFixed(2)
            : '',
        stock: initialData?.product_variants?.[0]?.stock_count ?? '',
        is_nsfw: initialData?.is_nsfw || false,
        is_published: initialData?.is_published || false,
        is_custom_order: initialData?.is_custom_order || false,
    });

    const [images, setImages] = useState<ProductImage[]>(
        initialData?.product_images?.map((img: any) => ({
            url: img.url,
            is_primary: img.is_primary,
        })) || []
    );

    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        initialData?.product_categories?.map((pc: any) => pc.category_id) || []
    );

    // Load categories on mount
    useEffect(() => {
        fetch('/api/admin/categories')
            .then(r => r.json())
            .then(json => setCategories(json.categories || []))
            .catch(console.error);
    }, []);

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: !isEditing ? generateSlug(name) : prev.slug,
        }));
    };

    // Image upload — converts to WebP via server API
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        e.target.value = ''; // allow re-selecting same file

        const form = new FormData();
        form.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Upload failed');

            setImages(prev => [
                ...prev,
                { url: json.url, is_primary: prev.length === 0 },
            ]);
        } catch (err: any) {
            setErrors(prev => ({ ...prev, upload: err.message }));
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // If removed the primary, make first one primary
            if (prev[index].is_primary && updated.length > 0) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };

    const setPrimaryImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === index })));
    };

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            short_description: formData.short_description || null,
            is_nsfw: formData.is_nsfw,
            is_published: formData.is_published,
            is_custom_order: formData.is_custom_order,
            price: formData.price,
            stock: formData.stock,
            images,
            category_ids: selectedCategoryIds,
        };

        try {
            const url = isEditing
                ? `/api/admin/products/${initialData.id}`
                : '/api/admin/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Save failed');

            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            setErrors({ submit: err.message || 'Failed to save product' });
        } finally {
            setLoading(false);
        }
    };

    // Group categories: SFW vs 18+
    const sfwCategories = categories.filter(c => !c.is_nsfw);
    const nsfwCategories = categories.filter(c => c.is_nsfw);

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formHeader}>
                <h1 className={styles.title}>
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h1>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={styles.saveBtn}>
                        {loading && <Loader2 className={styles.spinner} size={16} />}
                        <Save size={16} />
                        Save Product
                    </button>
                </div>
            </div>

            {errors.submit && <div className={styles.errorBanner}>{errors.submit}</div>}

            <div className={styles.grid}>
                {/* ---- Main Column ---- */}
                <div className={styles.mainColumn}>

                    {/* Basic Info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Product Details</h3>
                        <div className={styles.field}>
                            <label>Product Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                placeholder="e.g. Leather Wrist Cuffs"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>URL Slug *</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                required
                                placeholder="e.g. leather-wrist-cuffs"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Short Description</label>
                            <input
                                type="text"
                                value={formData.short_description}
                                onChange={e => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                                placeholder="One-line summary shown in product listings"
                                maxLength={160}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Full Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={6}
                                placeholder="Detailed product description..."
                                className={styles.textarea}
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Product Images</h3>
                        <p className={styles.cardHint}>
                            Images are automatically converted to WebP for optimal quality and load times.
                        </p>
                        {errors.upload && (
                            <div className={styles.errorBanner} style={{ marginBottom: 12 }}>{errors.upload}</div>
                        )}
                        <div className={styles.imageGrid}>
                            {images.map((img, idx) => (
                                <div key={idx} className={styles.imagePreview}>
                                    <img src={img.url} alt="Product" loading="lazy" />
                                    {img.is_primary && (
                                        <span className={styles.primaryBadge}>
                                            <Star size={10} /> Main
                                        </span>
                                    )}
                                    <div className={styles.imageOverlay}>
                                        {!img.is_primary && (
                                            <button
                                                type="button"
                                                onClick={() => setPrimaryImage(idx)}
                                                className={styles.setMainBtn}
                                                title="Set as main image"
                                            >
                                                <Star size={12} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className={styles.removeImageBtn}
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div
                                className={`${styles.uploadZone} ${uploading ? styles.uploading : ''}`}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {uploading ? (
                                    <>
                                        <Loader2 size={24} className={styles.spinner} />
                                        <span>Converting to WebP…</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span>Add Image</span>
                                        <span className={styles.uploadHint}>JPEG, PNG, WebP</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---- Side Column ---- */}
                <div className={styles.sideColumn}>

                    {/* Pricing & Stock */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Pricing & Stock</h3>
                        <div className={styles.field}>
                            <label>Price (USD) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Stock Count *</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                required
                                min="0"
                                placeholder="0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Settings</h3>
                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                                />
                                <span>
                                    <strong>Published</strong>
                                    <br />
                                    <small>Visible to customers</small>
                                </span>
                            </label>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_nsfw}
                                    onChange={e => setFormData(prev => ({ ...prev, is_nsfw: e.target.checked }))}
                                />
                                <span>
                                    <strong>18+ Only</strong>
                                    <br />
                                    <small>Appears in 18+ collection only</small>
                                </span>
                            </label>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_custom_order}
                                    onChange={e => setFormData(prev => ({ ...prev, is_custom_order: e.target.checked }))}
                                />
                                <span>
                                    <strong>Custom Order</strong>
                                    <br />
                                    <small>Made-to-order, no stock limit</small>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Collections */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Collections</h3>
                        {categories.length === 0 ? (
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                No collections found.
                            </p>
                        ) : (
                            <>
                                {sfwCategories.length > 0 && (
                                    <div className={styles.categoryGroup}>
                                        <p className={styles.categoryGroupLabel}>General</p>
                                        {sfwCategories.map(cat => (
                                            <label key={cat.id} className={styles.checkbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategoryIds.includes(cat.id)}
                                                    onChange={() => toggleCategory(cat.id)}
                                                />
                                                <span>{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {nsfwCategories.length > 0 && (
                                    <div className={styles.categoryGroup} style={{ marginTop: '0.75rem' }}>
                                        <p className={styles.categoryGroupLabel}>18+ Collections</p>
                                        {nsfwCategories.map(cat => (
                                            <label key={cat.id} className={styles.checkbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategoryIds.includes(cat.id)}
                                                    onChange={() => toggleCategory(cat.id)}
                                                />
                                                <span>{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
