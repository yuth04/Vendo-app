export interface ImageSearchProduct {
    id: number;
    name: string;
    price: string;
    image: string;
    size: string;
    similarity: number;
}

export interface ImageSearchResponse {
    message: string;
    data: ImageSearchProduct[];
}