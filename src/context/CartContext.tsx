'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface CartItemData {
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    image: string | null;
    slug: string;
    isNsfw: boolean;
    maxStock: number;
}

interface CartContextType {
    items: CartItemData[];
    itemCount: number;
    subtotal: number;
    addItem: (item: Omit<CartItemData, 'id'>) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'wol_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItemData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // Invalid data, ignore
        }
        setIsHydrated(true);
    }, []);

    // Persist cart to localStorage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addItem = useCallback((newItem: Omit<CartItemData, 'id'>) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.variantId === newItem.variantId);
            if (existing) {
                return prev.map((item) =>
                    item.variantId === newItem.variantId
                        ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxStock) }
                        : item
                );
            }
            return [
                ...prev,
                { ...newItem, id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}` },
            ];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((variantId: string) => {
        setItems((prev) => prev.filter((item) => item.variantId !== variantId));
    }, []);

    const updateQuantity = useCallback((variantId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((item) => item.variantId !== variantId));
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.variantId === variantId
                    ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                    : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isOpen,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
