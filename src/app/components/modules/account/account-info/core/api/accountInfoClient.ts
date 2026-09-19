import { uploadClient } from "@/src/app/components/services/api/uploadClient";
import {ENDPOINTS} from "@/src/app/components/modules/account/account-info/core/api/endpoints";
import {apiClient} from "@/src/app/components/services/api/apiClient";
import {User} from "@/src/app/components/modules/account/account-info/core/models/accountInfoModel";


const TOKEN_KEY               = 'auth_token';
const USER_KEY                = 'auth_user';

const notifyAuthUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-updated'));
    }
};

export const accountInfoauthClient = {
    //------- Update Name ---------//
    updateName: async (first_name: string, last_name: string): Promise<User | null> => {
        const response = await apiClient.put<{ message: string; user?: User }>(
            ENDPOINTS.updatename,
            { first_name, last_name }
        );
        const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null') as User | null;
        const updatedUser: User = {
            ...(currentUser ?? {}),
            ...(response.data?.user ?? {}),
            first_name,
            last_name,
        } as User;
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        notifyAuthUpdate();
        return updatedUser;
    },

    //------ Upload Image ------------//
    uploadImage: async (file: File): Promise<User | null> => {
        const token = typeof window !== 'undefined'
            ? localStorage.getItem(TOKEN_KEY) ?? undefined
            : undefined;

        const formData = new FormData();
        formData.append('image', file);

        const response = await uploadClient.upload<any>(ENDPOINTS.uploadimage, formData, token);
        if (response.error) {
            throw {
                response: {
                    data: { message: response.error.message || 'Failed to upload image.' },
                },
            };
        }

        const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null') as User | null;
        const updatedUser: User = {
            ...(response.data?.user ?? currentUser ?? {}),
            image: response.data?.user?.image
                ?? response.data?.image
                ?? response.data?.url
                ?? response.data?.path
                ?? response.data?.avatar
                ?? currentUser?.image
                ?? '',
        } as User;
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        notifyAuthUpdate();
        return updatedUser;
    },
};