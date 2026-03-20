'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Loader2 } from 'lucide-react';
import styles from '../admin.module.css';
import formStyles from './categories.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_nsfw: boolean;
    is_visible: boolean;
    sort_order: number;
    product_categories: { product_id: string }[];
}

interface CategoryManagerProps {
    initialCategories: Category[];
}

const emptyForm = {
    name: '',
    slug: '',
    description: '',
    is_nsfw: false,
    is_visible: true,
    sort_order: 0,
};

function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const openNewForm = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setError('');
        setIsFormOpen(true);
    };

    const openEditForm = (cat: Category) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            is_nsfw: cat.is_nsfw,
            is_visible: cat.is_visible,
            sort_order: cat.sort_order,
        });
        setError('');
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setError('');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: editingId ? prev.slug : generateSlug(name),
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const url = editingId
            ? `/api/admin/categories/${editingId}`
            : '/api/admin/categories';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Save failed');

            // Refresh categories list
            const listRes = await fetch('/api/admin/categories');
            const listJson = await listRes.json();
            setCategories(listJson.categories || []);
            closeForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"? Products will lose this category assignment.`)) return;
        setDeletingId(id);

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Delete failed');
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleVisible = async (cat: Category) => {
        try {
            const res = await fetch(`/api/admin/categories/${cat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cat, is_visible: !cat.is_visible }),
            });
            if (!res.ok) throw new Error('Update failed');
            setCategories(prev =>
                prev.map(c => c.id === cat.id ? { ...c, is_visible: !c.is_visible } : c)
            );
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Collections</h1>
                <button onClick={openNewForm} className={styles.addBtn}>
                    <Plus size={16} />
                    Add Collection
                </button>
            </div>

            {/* Category Form Modal */}
            {isFormOpen && (
                <div className={formStyles.modalOverlay}>
                    <div className={formStyles.modal}>
                        <div className={formStyles.modalHeader}>
                            <h2 className={formStyles.modalTitle}>
                                {editingId ? 'Edit Collection' : 'New Collection'}
                            </h2>
                            <button onClick={closeForm} className={formStyles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className={formStyles.form}>
                            {error && <div className={formStyles.errorBanner}>{error}</div>}

                            <div className={formStyles.field}>
                                <label>Collection Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                    placeholder="e.g. Leather Goods"
                                    className={formStyles.input}
                                />
                            </div>

                            <div className={formStyles.field}>
                                <label>Slug (URL identifier) *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    required
                                    placeholder="e.g. leather-goods"
                                    className={formStyles.input}
                                />
                                <span className={formStyles.hint}>Used in the URL: /shop?category=slug</span>
                            </div>

                            <div className={formStyles.field}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    placeholder="Brief description of this collection"
                                    className={formStyles.textarea}
                                />
                            </div>

                            <div className={formStyles.row}>
                                <div className={formStyles.field}>
                                    <label>Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={e => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                        min={0}
                                        className={formStyles.inputSmall}
                                    />
                                </div>
                            </div>

                            <div className={formStyles.checkboxGroup}>
                                <label className={formStyles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_visible}
                                        onChange={e => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                                    />
                                    <span>Visible in Shop Filter</span>
                                </label>
                                <label className={formStyles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_nsfw}
                                        onChange={e => setFormData(prev => ({ ...prev, is_nsfw: e.target.checked }))}
                                    />
                                    <span>18+ Only Collection</span>
                                </label>
                            </div>

                            <div className={formStyles.modalFooter}>
                                <button type="button" onClick={closeForm} className={formStyles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className={formStyles.saveBtn}>
                                    {saving ? <Loader2 size={16} className={formStyles.spinner} /> : <Save size={16} />}
                                    {editingId ? 'Save Changes' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            {categories && categories.length > 0 ? (
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Collection</th>
                            <th>Slug</th>
                            <th>Products</th>
                            <th>Type</th>
                            <th>Visible</th>
                            <th>Sort</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                                    {cat.name}
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{cat.slug}</td>
                                <td>{(cat.product_categories as unknown as unknown[])?.length || 0}</td>
                                <td>
                                    {cat.is_nsfw ? (
                                        <span style={{ color: 'var(--color-accent-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>18+</span>
                                    ) : (
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>SFW</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleToggleVisible(cat)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: cat.is_visible ? 'var(--color-success)' : 'var(--color-text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            fontSize: '0.75rem',
                                        }}
                                        title={cat.is_visible ? 'Click to hide from shop' : 'Click to show in shop'}
                                    >
                                        {cat.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {cat.is_visible ? 'Visible' : 'Hidden'}
                                    </button>
                                </td>
                                <td>{cat.sort_order}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => openEditForm(cat)}
                                            className={styles.actionBtn}
                                            title="Edit collection"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            disabled={deletingId === cat.id}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.7rem',
                                                color: 'var(--color-error)',
                                                background: 'transparent',
                                                border: '1px solid var(--color-error)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                            }}
                                            title="Delete collection"
                                        >
                                            {deletingId === cat.id ? <Loader2 size={12} /> : <Trash2 size={12} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <h3>No collections yet</h3>
                    <p>Create your first collection to organize your products.</p>
                </div>
            )}
        </>
    );
}
