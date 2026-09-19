"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {Product, ProductVariant} from "@/src/app/components/modules/products/core/models/productsModel";

// ---- Types ---- //
export interface LocalCartItem {
    product_variant_id: number;
    quantity: number;
}

export interface CartItem {
    id: string;
    product_id: number;
    product_variant_id: number;
    quantity: number;
    product: Product;
    variant: ProductVariant;
}

interface CartContextValue {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    mounted: boolean;
    addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    refreshCart: () => void;
    syncServerCart: (serverItems: LocalCartItem[]) => void;
}

const LS_KEY = 'cart_items';

function readLS(): CartItem[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeLS(items: CartItem[]) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch { /* quota / SSR */ }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items,   setItems]   = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setItems(readLS());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) writeLS(items);
    }, [items, mounted]);

    // ---- Add ---- //
    const addToCart = useCallback((
        product: Product,
        variant: ProductVariant,
        quantity = 1,
    ) => {
        const key = `${product.id}-${variant.id}`;
        setItems((prev) => {
            const existing = prev.find((i) => i.id === key);
            if (existing) {
                return prev.map((i) =>
                    i.id === key
                        ? { ...i, quantity: Math.min(i.quantity + quantity, variant.stock) }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    id: key,
                    product_id: product.id,
                    product_variant_id: variant.id,
                    quantity: Math.min(quantity, variant.stock),
                    product,
                    variant,
                },
            ];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) {
            setItems((prev) => prev.filter((i) => i.id !== id));
            return;
        }
        setItems((prev) =>
            prev.map((i) => i.id === id ? { ...i, quantity } : i),
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        writeLS([]);
    }, []);

    const refreshCart = useCallback(() => {
        setItems(readLS());
    }, []);

    // ---- Sync server cart after login ---- //
    const syncServerCart = useCallback((serverItems: LocalCartItem[]) => {
        setItems((prev) => {
            const merged: CartItem[] = serverItems.map((si) => {
                // Reuse full product/variant data from local cart if available
                const existing = prev.find((i) => i.product_variant_id === si.product_variant_id);

                if (existing) {
                    return { ...existing, quantity: si.quantity };
                }

                // Server-only item — skeleton (product/variant data loads when cart opens)
                return {
                    id:                 `variant-${si.product_variant_id}`,
                    product_id:         0,
                    product_variant_id: si.product_variant_id,
                    quantity:           si.quantity,
                    product:            null as any,
                    variant:            null as any,
                };
            });

            writeLS(merged);
            return merged;
        });
    }, []);

    const totalItems = useMemo(
        () => items.reduce((s, i) => s + i.quantity, 0),
        [items],
    );

    const totalPrice = useMemo(
        () => items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0),
        [items],
    );

    const value = useMemo<CartContextValue>(() => ({
        items,
        totalItems,
        totalPrice,
        mounted,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        syncServerCart,
    }), [items, totalItems, totalPrice, mounted, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, syncServerCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
}