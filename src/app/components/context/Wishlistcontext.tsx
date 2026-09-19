"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {WishlistItem} from "@/src/app/components/modules/wishlist/core/models/wishlistModel";
import {wishlistClient} from "@/src/app/components/modules/wishlist/core/api/wishlistClient";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";


interface WishlistContextValue {
    wishlists: WishlistItem[];
    count: number;
    loading: boolean;
    isAuthenticated: boolean;
    isWishlisted: (productId: number) => boolean;
    toggleWishlist: (productId: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function parseWishlists(data: any): WishlistItem[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.wishlists)) return data.wishlists;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.wishlists)) return data.data.wishlists;
    return [];
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const wishlistsRef = useRef<WishlistItem[]>([]);
    const refreshingRef = useRef(false);

    const syncSet = useCallback((items: WishlistItem[]) => {
        wishlistsRef.current = items;
        setWishlists(items);
    }, []);

    useEffect(() => {
        setIsAuthenticated(!!authService.getToken());
    }, []);

    const refresh = useCallback(async (): Promise<void> => {
        if (!authService.getToken()) {
            setIsAuthenticated(false);
            syncSet([]);
            return;
        }
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        setLoading(true);
        try {
            const res = await wishlistClient.fetchWishlists();
            if (res.error) {
                if ((res.error as any)?.status === 401) {
                    setIsAuthenticated(false);
                    syncSet([]);
                }
                return;
            }
            setIsAuthenticated(true);
            syncSet(parseWishlists(res.data));
        } catch {

        } finally {
            setLoading(false);
            refreshingRef.current = false;
        }
    }, [syncSet]);

    useEffect(() => {
        refresh();
        const onAuth = () => refresh();
        window.addEventListener("auth-updated", onAuth);
        return () => window.removeEventListener("auth-updated", onAuth);
    }, [refresh]);

    const isWishlisted = useCallback(
        (productId: number) => wishlistsRef.current.some((w) => w.product_id === productId),
        [wishlists]
    );

    const toggleWishlist = useCallback(async (productId: number) => {
        if (!authService.getToken()) {
            window.location.href = "/login";
            return;
        }

        const alreadyAdded = wishlistsRef.current.some((w) => w.product_id === productId);

        if (alreadyAdded) {
            syncSet(wishlistsRef.current.filter((w) => w.product_id !== productId));

            const res = await wishlistClient.deleteWishlist(productId);

            if (!res.error) return;

            const status = (res.error as any)?.status;
            if (status === 401) {
                setIsAuthenticated(false);
                window.location.href = "/login";
            } else {
                await refresh();
            }

        } else {
            const temp: WishlistItem = { id: -Date.now(), product_id: productId };
            syncSet([...wishlistsRef.current, temp]);

            const res = await wishlistClient.addWishlist(productId);

            if (res.error) {
                const status = (res.error as any)?.status;
                if (status === 401) {
                    setIsAuthenticated(false);
                    window.location.href = "/login";
                }
                await refresh();
                return;
            }

            await refresh();
        }
    }, [refresh, syncSet]);

    return (
        <WishlistContext.Provider
            value={{ wishlists, count: wishlists.length, loading, isAuthenticated, isWishlisted, toggleWishlist, refresh }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
    return ctx;
}