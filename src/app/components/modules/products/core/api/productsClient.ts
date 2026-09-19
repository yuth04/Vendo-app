import {
    Brand,
    BrandListResponse,
    CategoryListResponse, DiscountListResponse, NewProductResponse, ProductDetailResponse, ProductImagesResponse,
    ProductListResponse, TopSaleResponse
} from "@/src/app/components/modules/products/core/models/productsModel";
import {ENDPOINTS} from "@/src/app/components/modules/products/core/api/endpoints";
import {apiClient} from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";


export const productClient = {

    fetchCategories: async (): Promise<CategoryListResponse> =>
        apiClient.get(ENDPOINTS.category),

    fetchProduct:async (): Promise<ProductListResponse> =>
        apiClient.get(ENDPOINTS.products),

    fetchBrandProduct: async (): Promise<BrandListResponse> => {
        const res = await apiClient.get<{ brands: Brand[] }>(ENDPOINTS.brands);
        if (res.data?.brands) {
            res.data.brands = res.data.brands.map((brand: any) => ({
                ...brand,
                image: brand[' image'] ?? brand['image'] ?? null,
            }));
        }
        return res;
    },

    fetchProductById: async (id: number | string): Promise<ProductDetailResponse> =>
        apiClient.get(`${ENDPOINTS.products}/${id}`),

    fetchProductImages: async (): Promise<ProductImagesResponse> =>
        apiClient.get(ENDPOINTS.productvariants),


    fetchDiscounts: async (): Promise<ApiResponse<DiscountListResponse>> =>
        apiClient.get<DiscountListResponse>(ENDPOINTS.discounts),

    fetchTopSales: async (): Promise<ApiResponse<TopSaleResponse>> =>
        apiClient.get<TopSaleResponse>(ENDPOINTS.topsales),

    fetchNewProducts: async (): Promise<ApiResponse<NewProductResponse>> =>
        apiClient.get<NewProductResponse>(ENDPOINTS.newproducts),
};
