import { ApiResponse } from '@/src/app/components/services/utils/models';

// ----- Reviews ----- //
export interface ReviewUser {
    id: number;
    email?: string;
    role?: string;
    image?: string | null;
    image_file_id?: string | null;
    first_name?: string;
    last_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Review {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string;
    is_approved: boolean;
    image?: string | null;
    image_file_id?: string | null;
    created_at?: string;
    created_at_human?: string;
    parent_id?: number | null;
    user?: ReviewUser;
    product?: DiscountProduct;
    replies?: Review[];
}

export type ReviewListResponse  = ApiResponse<Review[]>;
export type ReviewCreateResponse = ApiResponse<Review>;
export type ReviewDeleteResponse = ApiResponse<null>;

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