'use client';

import { User } from "@/src/app/components/modules/account/account-info/core/models/accountInfoModel";

export const accountInfoService = {
    /**
     * Determines whether the form text buffers contain updates compared against cache models
     */
    checkIsNameChanged(firstName: string, lastName: string, user: User | null): boolean {
        return firstName.trim() !== (user?.first_name ?? '') ||
            lastName.trim() !== (user?.last_name ?? '');
    },

    /**
     * Evaluates file payload allocations against constraints
     */
    isSizeExceeded(fileSize: number, maxBytes: number): boolean {
        return fileSize > maxBytes;
    },

    /**
     * Generates responsive file allocation statistics labels
     */
    formatFileSizeMb(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(1);
    },

    /**
     * Extracts first index sequence initializers for missing media placeholders
     */
    getUserInitial(user: User | null): string {
        return user?.first_name?.[0]?.toUpperCase() ?? '?';
    },

    /**
     * Aggregates catch blocks into flattened, readable notification text elements
     */
    parseNameError(err: any): string {
        const data = err?.response?.data;
        if (data?.errors) {
            return Object.values(data.errors as Record<string, string[]>)
                .flat()
                .join(' ');
        }
        return data?.message || 'Failed to update name. Please try again.';
    }
};