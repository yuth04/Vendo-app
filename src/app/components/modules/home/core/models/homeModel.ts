import {ApiResponse} from "@/src/app/components/services/utils/models";

export interface Carousel {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string | null;
    position: number;
    status: boolean;
    created_at: string;
    updated_at: string;
    image_file_id: string;
}

export type CarouselListResponse = ApiResponse<{
    carousels: Carousel[];
}>;


export interface SubCategory {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products?: any[];
}

export interface ParentCategory {
    id: number;
    name: string;
    slug?: string;
    categories: SubCategory[];
}

export interface ParentCategoryListResponse {
    message: string;
    data: ParentCategory[];
}