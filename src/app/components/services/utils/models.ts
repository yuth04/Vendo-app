/* eslint-disable @typescript-eslint/no-explicit-any */
import {Category} from "@/src/app/components/modules/products/core/models/productsModel";

/**
 * HTTP methods supported by the API helper
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Models
 * Standardized request options for API calls.
 * Extends the native RequestInit (except `method` and `body`) and adds:
 * - method: HTTP method override
 * - token: optional Bearer token for authentication
 * - body: request payload (object or string)
 * - retries: number of retry attempts for transient failures
 * - params: query parameters as key-value pairs
 * - timeoutMs: request timeout in milliseconds
 * - contentType: custom Content-Type header
 */
export interface Models extends Omit<RequestInit, 'method' | 'body'> {
    method?: HttpMethod;
    token?: string;
    body?: any;
    retries?: number;
    params?: Record<string, string | number | boolean>;
    timeoutMs?: number;
    contentType?: string;
}

/**
 * ApiError
 * Standardized error object returned by API helpers.
 * - status: HTTP status code (if available)
 * - code: internal error code (e.g., FETCH_ERROR, UPLOAD_ERROR, HTTP_ERROR)
 * - message: human-readable error description
 */
export interface ApiError {
    status?: number;
    code?: string;
    message: string;
    data?: any;
}

/**
 * ApiResponse<T>
 * Standardized response wrapper returned by API helpers.
 * - data: typed payload returned from the API (null if request failed)
 * - error: ApiError object (null if request succeeded)
 */
export interface ApiResponse<T> {
    category: Category[] | undefined;
    status?: string;
    message?: string;
    data: T | null;
    error: ApiError | null;
}
