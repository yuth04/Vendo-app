import {apiClient} from "@/src/app/components/services/api/apiClient";
import {ENDPOINTS} from "@/src/app/components/modules/account/password/core/api/endpoints";



export const changePasswordClient = {

    //------ Change Password ------//
    changePassword: async (
        current_password: string,
        new_password: string,
        new_password_confirmation: string,
    ): Promise<{ message: string } | null> => {
        const response = await apiClient.put<{ message: string }>(
            ENDPOINTS.changepassword,
            { current_password, new_password, new_password_confirmation }
        );
        if (response.error || !response.data) {
            throw {
                response: {
                    data: {
                        message: response.error?.message || 'Failed to change password.',
                        errors: (response.error as any)?.data?.errors ?? null,
                    },
                },
            };
        }
        return response.data;
    },
};