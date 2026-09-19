import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {ENDPOINTS} from "@/src/app/components/layout/footer/core/api/endpoints";


export const footerClient = {
    fetchFooters: async (signal?: AbortSignal): Promise<ApiResponse<[]>> =>
        apiClient.get(ENDPOINTS.footers, { signal }),
};