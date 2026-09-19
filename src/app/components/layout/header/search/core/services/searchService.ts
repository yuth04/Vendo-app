import { searchClient } from "@/src/app/components/layout/header/search/core/api/searchClient";
import { ImageSearchProduct } from "@/src/app/components/layout/header/search/core/models/searchModel";

const IMAGE_SEARCH_RESULTS_KEY = "vendo_image_search_results";
const IMAGE_PREVIEW_KEY         = "vendo_search_image_preview";

export const searchService = {
    searchByImage: async (file: File): Promise<ImageSearchProduct[]> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await searchClient.searchByImage(formData);

        if (response.error) {
            throw new Error(response.error.message ?? "Image search failed");
        }

        let products: ImageSearchProduct[] = [];

        if (response.data) {
            if (Array.isArray(response.data)) {
                products = response.data;
            } else {
                const rawData = response.data as unknown as Record<string, unknown>;

                if (rawData.data && Array.isArray(rawData.data)) {
                    products = rawData.data as ImageSearchProduct[];
                } else if (rawData.products && Array.isArray(rawData.products)) {
                    products = rawData.products as ImageSearchProduct[];
                }
            }
        }

        console.log(" searchService captured products from backend:", products);

        sessionStorage.setItem(IMAGE_SEARCH_RESULTS_KEY, JSON.stringify(products));

        return products;
    },

    getStoredImageResults: (): ImageSearchProduct[] => {
        try {
            const stored = sessionStorage.getItem(IMAGE_SEARCH_RESULTS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    storeImagePreviewUrl: (dataUrl: string) => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(IMAGE_PREVIEW_KEY, dataUrl);
        }
    },

    getStoredImagePreviewUrl: (): string | null => {
        if (typeof window !== "undefined") {
            return sessionStorage.getItem(IMAGE_PREVIEW_KEY);
        }
        return null;
    },

    clearImageResults: () => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem(IMAGE_SEARCH_RESULTS_KEY);
            sessionStorage.removeItem(IMAGE_PREVIEW_KEY);
        }
    },
};