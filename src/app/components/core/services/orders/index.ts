import { apiClient } from '../_index';
import { ENDPOINTS } from '../_index';
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {
    ApplyCouponPayload, ApplyCouponResponse,
    OrderHistoryResponse,
    ReturnOrderHistoryResponse,
    ReturnOrderPayload
} from "@/src/app/components/core/services/orders/model";




export const orderService = {
    fetchOrders: async (signal?: AbortSignal): Promise<ApiResponse<OrderHistoryResponse>> =>
        apiClient.get(ENDPOINTS.orders, { signal }),

    cancelOrder: async (id: string | number): Promise<ApiResponse<any>> => {
        return apiClient.delete(`${ENDPOINTS.orders}/cancel/${id}`);
    },

    fetchReturnOrders: async (signal?: AbortSignal): Promise<ApiResponse<ReturnOrderHistoryResponse>> =>
        apiClient.get(ENDPOINTS.returnsorders, { signal }),

    submitReturn: async (payload: ReturnOrderPayload): Promise<ApiResponse<any>> => {
        return apiClient.post(ENDPOINTS.returnsorders, payload);
    },

    applyCoupon: async (payload: ApplyCouponPayload): Promise<ApiResponse<ApplyCouponResponse>> => {
        return apiClient.post(ENDPOINTS.applycoupon, payload);
    },
};
