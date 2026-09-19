import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ENDPOINTS } from "@/src/app/components/layout/header/search/core/api/endpoints";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {ImageSearchResponse} from "@/src/app/components/layout/header/search/core/models/searchModel";


export const searchClient = {
    searchByImage: async (formData: FormData): Promise<ApiResponse<ImageSearchResponse>> =>
        apiClient.post(ENDPOINTS.search, formData),
};