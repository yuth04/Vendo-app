import { ApiResponse } from '@/src/app/components/services/utils/models';

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products?: any[];
}

//----- Variant image -----//
export interface VariantImage {
    id: number;
    image: string;
    position: number;
    alt_text: string | null;
    is_primary: boolean;
    image_file_id: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ProductVariant {
    id: number;
    product_id?: number;
    size: string;
    color: string;
    stock: number;
    images: VariantImage[];
    created_at?: string;
    updated_at?: string;
}



export interface BrandProduct {
    id: number;
    productName: string;
    slug: string;
    description: string;
    price: string;
    category_id: number;
    brand_id: number;
    image_file_id: number | null;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    created_at?: string;
    updated_at?: string;
    products?: BrandProduct[];
}

export interface Product {
    id: number;
    productName: string;
    slug: string;
    description: string;
    price: string;
    image: string | null;
    category: Category;
    brand: Brand;
    variants: ProductVariant[];
    brand_id: number;
    category_id?: number;
    discount_price?: number | null;
    " image"?: string | null;
}

//----- WishlistItem -----//
export interface WishlistItem {
    id: number;
    product_id: number;
    user_id?: number;
    product?: Product;
    created_at?: string;
    updated_at?: string;
}

export type WishlistListResponse = ApiResponse<WishlistItem[]>;

export type WishlistAddResponse = ApiResponse<WishlistItem>;

export type WishlistDeleteResponse = ApiResponse<null>;

//----- Updated Discount Model -----//
export interface DiscountCoupon {
    id: number;
    name: string;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    start_date: string;
    end_date: string;
    min_amount: string;
    max_discount: string;
    usage_limit: number;
    used: number;
    description: string | null;
    image: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    discount_id: number;
}

export interface DiscountProduct {
    id: number;
    productName: string;
    slug: string;
    description: string;
    price: string;
    category_id: number;
    brand_id: number;
    image_file_id: number | null;
    image: string | null;
    discount_price: string;
    status: string;
}

export interface DiscountCategory {
    id: number;
    name: string;
    description: string | null;
    amount: string;
    type: 'percent' | 'fixed';
    start_date: string;
    end_date: string;
    banner_image: string | null;
    is_active: boolean;
    slug: string | null;
    products: DiscountProduct[];
    coupon: DiscountCoupon | null;
}

export interface DiscountListResponse {
    message: string;
    discount: DiscountCategory[];
}