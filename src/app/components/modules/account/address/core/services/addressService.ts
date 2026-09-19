'use client';

import { addressClient } from "@/src/app/components/modules/account/address/core/api/addressClient";
import { Address as AddressModel, AddressPayload } from "@/src/app/components/modules/account/address/core/models/addressModel";

export const addressService = {
    // Read
    getAddresses: async (): Promise<AddressModel[]> => {
        return await addressClient.getAddresses();
    },

    // Create
    createAddress: async (payload: AddressPayload) => {
        return await addressClient.createAddress(payload);
    },

    // Update
    updateAddress: async (id: number, payload: AddressPayload) => {
        return await addressClient.updateAddress(id, payload);
    },

    // Delete
    deleteAddress: async (id: number) => {
        return await addressClient.deleteAddress(id);
    }
};