import {apiClient} from "@/src/app/components/services/api/apiClient";
import {
    WishlistAddResponse, WishlistDeleteResponse,
    WishlistListResponse
} from "@/src/app/components/modules/wishlist/core/models/wishlistModel";
import {ENDPOINTS} from "@/src/app/components/modules/wishlist/core/api/endpoints";


export const wishlistClient = {

//----Wishlist----//
    fetchWishlists: async (): Promise<WishlistListResponse> =>
        apiClient.get(ENDPOINTS.wishlists),

    //---- add/wishlists ----//
    addWishlist: async (productId: number): Promise<WishlistAddResponse> =>
        apiClient.post(ENDPOINTS.wishlists, { product_id: productId }),

    //---- delete-wishlist -----//
    deleteWishlist: async (productId: number): Promise<WishlistDeleteResponse> =>
        apiClient.delete(`${ENDPOINTS.wishlists}/${productId}`),

};