import {
    CarouselListResponse,
    ParentCategoryListResponse
} from "@/src/app/components/modules/home/core/models/homeModel";
import {apiClient} from "@/src/app/components/services/api/apiClient";
import {ENDPOINTS} from "@/src/app/components/modules/home/core/api/endpoints";
import {ApiResponse} from "@/src/app/components/services/utils/models";



export const homeClient = {

    fetchCarousels: async (): Promise<CarouselListResponse> =>
        apiClient.get(ENDPOINTS.carousel),

    fetchParentCategories:async (): Promise<ApiResponse<ParentCategoryListResponse[]>> =>
        apiClient.get(ENDPOINTS.parentcategory ,{ retries: 0 }),
};