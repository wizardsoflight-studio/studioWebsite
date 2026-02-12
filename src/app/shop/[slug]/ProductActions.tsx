'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import styles from './detail.module.css';

interface Variant {
    id: string;
    name: string;
    price: number;
    stock_count: number;
    options: Record<string, string>;
    compare_at_price: number | null;
}

interface ProductActionsProps {
    variants: Variant[];
    optionKeys: string[];
    isCustomOrder: boolean;
    productName: string;
    productSlug: string;
    productImage: string | null;
    productId: string;
    isNsfw: boolean;
}

export default function ProductActions({
    variants,
    optionKeys,
    isCustomOrder,
    productName,
    productSlug,
    productImage,
    productId,
    isNsfw,
}: ProductActionsProps) {
    const { addItem } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        variants.length === 1 ? variants[0] : null
    );
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    // Get unique values for each option key
    const optionValues: Record<string, string[]> = {};
    optionKeys.forEach((key) => {
        const values = new Set<string>();
        variants.forEach((v) => {
            if (v.options[key]) values.add(v.options[key]);
        });
        optionValues[key] = Array.from(values);
    });

    const handleOptionSelect = (key: string, value: string) => {
        const newOptions = { ...selectedOptions, [key]: value };
        setSelectedOptions(newOptions);

        const match = variants.find((v) =>
            optionKeys.every((k) => !newOptions[k] || v.options[k] === newOptions[k])
        );
        if (match && optionKeys.every((k) => newOptions[k])) {
            setSelectedVariant(match);
        }
    };

    const isOptionAvailable = (key: string, value: string) => {
        return variants.some((v) => {
            if (v.options[key] !== value) return false;
            return optionKeys.every((k) => {
                if (k === key) return true;
                if (!selectedOptions[k]) return true;
                return v.options[k] === selectedOptions[k];
            });
        });
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;
        addItem({
            variantId: selectedVariant.id,
            productId,
            productName,
            variantName: selectedVariant.name,
            price: selectedVariant.price,
            quantity,
            image: productImage,
            slug: productSlug,
            isNsfw,
            maxStock: selectedVariant.stock_count,
        });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    const isOutOfStock = selectedVariant ? selectedVariant.stock_count <= 0 : false;
    const displayPrice = selectedVariant ? selectedVariant.price : null;

    return (
        <>
            {optionKeys.length > 0 && !isCustomOrder && (
                <div className={styles.variantSection}>
                    {optionKeys.map((key) => (
                        <div key={key}>
                            <label className={styles.variantLabel}>{key}</label>
                            <div className={styles.variantOptions}>
                                {optionValues[key].map((value) => {
                                    const available = isOptionAvailable(key, value);
                                    return (
                                        <button
                                            key={value}
                                            className={`${styles.variantBtn} ${selectedOptions[key] === value ? styles.variantBtnActive : ''
                                                } ${!available ? styles.variantBtnDisabled : ''}`}
                                            onClick={() => available && handleOptionSelect(key, value)}
                                            disabled={!available}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {displayPrice && variants.length > 1 && (
                <div className={styles.productPrice}>
                    {formatPrice(displayPrice)}
                    {selectedVariant?.compare_at_price && (
                        <span className={styles.comparePrice}>
                            {formatPrice(selectedVariant.compare_at_price)}
                        </span>
                    )}
                </div>
            )}

            <div className={styles.addToCart}>
                {!isCustomOrder && (
                    <div className={styles.quantitySelector}>
                        <button
                            className={styles.quantityBtn}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className={styles.quantityValue}>{quantity}</span>
                        <button
                            className={styles.quantityBtn}
                            onClick={() => setQuantity(quantity + 1)}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                )}

                <button
                    className={styles.addToCartBtn}
                    disabled={!isCustomOrder && (!selectedVariant || isOutOfStock)}
                    onClick={isCustomOrder ? undefined : handleAddToCart}
                >
                    {justAdded ? (
                        <>
                            <Check size={18} />
                            Added!
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={18} />
                            {isCustomOrder
                                ? 'Request a Quote'
                                : isOutOfStock
                                    ? 'Out of Stock'
                                    : !selectedVariant
                                        ? 'Select Options'
                                        : 'Add to Cart'}
                        </>
                    )}
                </button>

                <button className={styles.wishlistBtn} aria-label="Add to Wishlist">
                    <Heart size={20} />
                </button>
            </div>
        </>
    );
}
