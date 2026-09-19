'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ApiResponse } from "@/src/app/components/services/utils/models";

interface AddressApiError {
    message: string;
    code?: string | number;
}

export function useAddressData<T>(
    fetchFn: (signal?: AbortSignal) => Promise<ApiResponse<T> | any>,
    defaultValue?: T,
    enableClientFetch: boolean = false,
) {
    const [data, setData] = useState<T | undefined>(defaultValue);
    const [error, setError] = useState<AddressApiError | null>(null);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const defaultValueRef = useRef(defaultValue);

    const refetchData = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!enableClientFetch) return;

        const controller = new AbortController();
        setLoading(true);

        fetchFn(controller.signal)
            .then((res) => {
                // Handle both standardized ApiResponse structure and raw arrays safely
                if (res && res.error) {
                    setError(res.error as AddressApiError);
                    setData(defaultValueRef.current);
                } else {
                    const extractedData = res?.data ?? res;
                    setData(extractedData ?? defaultValueRef.current);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError({
                        message: err?.response?.data?.message ?? err.message ?? 'Unknown error',
                        code: 'FETCH_ERROR'
                    });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();

    }, [fetchFn, enableClientFetch, count]);

    return { data, error, loading, refetchData, setData };
}