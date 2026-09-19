import {ApiResponse} from "@/src/app/components/services/utils/models";
//---address----//
export interface Address {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    address_line: string;
    city: string;
    province: string;
    phone: string;
    postal_code: string;
    is_default: boolean;
}

export interface AddressPayload {
    first_name: string;
    last_name: string;
    address_line: string;
    city: string;
    province: string;
    phone: string;
    postal_code: string;
    is_default?: boolean;
}

export type AddressCreateResponse = ApiResponse<{ address: Address }>;
export type AddressUpdateResponse = ApiResponse<{ address: Address }>;