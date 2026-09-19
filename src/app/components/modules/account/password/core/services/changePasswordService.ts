'use client';

export const changePasswordService = {
    /**
     * Checks if the confirmation password matches the primary input field.
     */
    checkPasswordMismatch(password: string, confirmation: string): boolean {
        return confirmation.length > 0 && password !== confirmation;
    },

    /**
     * Parses caught endpoint rejections and merges multiple field validation errors.
     */
    parseErrorMessage(err: any): string {
        const data = err?.response?.data;
        if (data?.errors) {
            return Object.values(data.errors as Record<string, string[]>)
                .flat()
                .join(' ');
        }
        return data?.message || 'Failed to change password. Please try again.';
    }
};