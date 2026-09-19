import { ApiResponse } from '@/src/app/components/services/utils/models';
import {Review} from "@/src/app/components/modules/product-details/core/models/reviewModel";

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    parent_id?: number | null;
    products?: any[];
}

export type CategoryListResponse = ApiResponse<{
    category: Category[];
}>;

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

export type ProductImagesResponse = ApiResponse<{
    product_variant: ProductVariant[];
}>;


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

export type BrandListResponse = ApiResponse<{
    brands: Brand[];
}>;

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

export type ProductListResponse = ApiResponse<{
    product: Product[];
}>;

export type ProductDetailResponse = ApiResponse<{
    product: Product;
}>;

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

//---TopSaleProduct---//
export interface TopSaleProduct {
    description: string;
    id: number;
    productName: string;
    slug: string;
    image: string;
    price: string;
    category: string;
    brand: Pick<Brand, 'id' | 'name'>;
    total_sales: number;
}

export interface TopSaleResponse {
    success: boolean;
    message: string;
    products: TopSaleProduct[];
}

export const EMPTY_TOP_SALES_RES: TopSaleResponse = {
    success: false,
    message: "",
    products: []
};

export const EMPTY_REVIEWS: Review[] = [];


//---NewProduct---//
export interface NewProduct {
    id: number;
    productName: string;
    slug: string;
    image: string;
    price: string;
    category: string;
    created_at: string;
}

export interface NewProductResponse {
    success: boolean;
    message: string;
    total: number;
    products: NewProduct[];
}

export const EMPTY_NEW_PRODUCTS_RES: NewProductResponse = {
    success: false,
    message: "",
    total: 0,
    products: []
};