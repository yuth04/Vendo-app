import {ENDPOINTS} from "@/src/app/components/modules/product-details/core/api/endpoints";
import {
    ReviewCreateResponse, ReviewDeleteResponse,
    ReviewListResponse
} from "@/src/app/components/modules/product-details/core/models/reviewModel";
import {apiClient} from "@/src/app/components/services/api/apiClient";


export const reviewClient = {
    //----ReviewsByProduct----//
    fetchAllReviews: async (): Promise<ReviewListResponse> =>
        apiClient.get(ENDPOINTS.reviews),

    fetchCurrentUser: async () =>
        apiClient.get(ENDPOINTS.profile),

    fetchReviewsByProduct: async (productId: number | string): Promise<ReviewListResponse> =>
        apiClient.get(`${ENDPOINTS.reviews}?product_id=${productId}`),

    createReview: async (productId: number, rating: number, comment: string): Promise<ReviewCreateResponse> =>
        apiClient.post(ENDPOINTS.reviews, { product_id: productId, rating, comment }),

    updateReview: async (reviewId: number, rating: number, comment: string, image?: File) => {
        const formData = new FormData();
        formData.append('rating', rating.toString());
        formData.append('comment', comment);

        if (image instanceof File) {
            formData.append('image', image);
        }

        return apiClient.post(`${ENDPOINTS.reviews}/${reviewId}`, formData, {
            headers: {
                'Accept': 'application/json',
            },
        });
    },

    deleteReview: async (reviewId: number): Promise<ReviewDeleteResponse> =>
        apiClient.delete(`${ENDPOINTS.reviews}/${reviewId}`),
};
