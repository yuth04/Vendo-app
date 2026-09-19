import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/src/app/components/services/utils/models";

interface ApiError {
    message: string;
    code?:   string;
}

export function useApiData<T>(
    fetchFn: (signal?: AbortSignal) => Promise<ApiResponse<T>>,
    defaultValue?: T,
    enableClientFetch: boolean = false,
) {
    const [data,    setData]    = useState<T | undefined>(defaultValue);
    const [error,   setError]   = useState<ApiError | null>(null);
    const [loading, setLoading] = useState(false);


    const refresh = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const res = await fetchFn(signal);
            if (res.error) {
                setError(res.error);
            } else {
                setData(res.data ?? undefined);
                setError(null);
            }
        } catch (err: any) {
            if (signal?.aborted) return;
            setError({
                message: err.message ?? "Unknown error",
                code: "FETCH_ERROR"
            });
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (!enableClientFetch) return;

        const controller = new AbortController();
        refresh(controller.signal).catch(() => {
        });

        return () => controller.abort();
    }, [enableClientFetch, refresh]);

    return { data, error, loading, refresh };
}