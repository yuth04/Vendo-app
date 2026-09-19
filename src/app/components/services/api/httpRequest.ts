import { ApiResponse, Models } from '../utils/models';

export const httpRequest = async <T>(
    url: string,
    options: Models = {},
    defaultValue: T | null = null,
): Promise<ApiResponse<T>> => {
    const queryString = options.params
        ? '?' + new URLSearchParams(Object.entries(options.params).map(([k, v]) => [k, String(v)])).toString()
        : '';
    const fullUrl = url + queryString;

    try {
        const hasBody = options.body !== undefined && options.body !== null;
        const isFormData = hasBody && options.body instanceof FormData;

        const headers: HeadersInit = {
            ...(hasBody && !isFormData ? { 'Content-Type': options.contentType ?? 'application/json' } : {}),
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
            ...options.headers,
        };

        const res = await fetch(fullUrl, {
            ...options,
            headers,
            body: hasBody
                ? isFormData
                    ? options.body
                    : JSON.stringify(options.body)
                : undefined,
            redirect: 'manual',
        });

        if (res.type === 'opaqueredirect' || res.status === 0) {
            return { data: {} as T, error: null, category: undefined };
        }

        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));

            const message =
                errJson.message ||
                errJson.error ||
                (errJson.errors
                    ? Object.values(errJson.errors as Record<string, string[]>).flat()[0]
                    : null) ||
                'Request failed';

            throw { status: res.status, message, data: errJson };
        }

        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        const finalData = json.data !== undefined ? json.data : json;

        return {
            data: finalData as T,
            error: null,
            category: json.category ?? undefined,
        };
    } catch (err: any) {
        return {
            data: defaultValue,
            error: {
                status: err?.status,
                message: err?.message || 'Unknown error',
                data: err?.data ?? null,
            },
            category: undefined,
        };
    }
};