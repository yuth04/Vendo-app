import {apiClient} from "@/src/app/components/services/api/apiClient";
import {ENDPOINTS} from "@/src/app/components/modules/account/address/core/api/endpoints";
import {
    Address,
    AddressCreateResponse,
    AddressPayload, AddressUpdateResponse
} from "@/src/app/components/modules/account/address/core/models/addressModel";



export const addressClient = {

    //--------- Get Addresses ----------//
    getAddresses: async (): Promise<Address[]> => {
        const response = await apiClient.get<{ address: Address[] }>(ENDPOINTS.addresses);
        return response.data?.address ?? [];
    },

    //--------- Create Address ----------//
    createAddress: async (payload: AddressPayload): Promise<AddressCreateResponse> =>
        apiClient.post<{ address: Address }>(ENDPOINTS.addresses, payload),

    //--------- Update Address ----------//
    updateAddress: (id: number, payload: Partial<AddressPayload>): Promise<AddressUpdateResponse> =>
        apiClient.put<{ address: Address }>(`${ENDPOINTS.addresses}/${id}`, payload),

    //--------- Delete Address ----------//
    deleteAddress: async (id: number): Promise<void> => {
        await apiClient.delete(`${ENDPOINTS.addresses}/${id}`);
    },
};