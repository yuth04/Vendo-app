// import { apiClient } from './apiClient';
// import { ENDPOINTS } from '../utils/endpoints';
// import { Category } from '../../core/services/home/model';
// /**
//  * Enterprise-ready API service
//  * Provides all backend API calls with type safety and optional retries.
//  * Each function returns a Promise<ApiResponse<T>> where T is the expected data type.
//  */
// export const apiService = {
//     /**
//      * Fetch About Me profile information.
//      * Makes a GET request to the /aboutMe endpoint.
//      * @returns Promise<ApiResponse<Category[]>>
//      */
//     fetchSample: () => apiClient.get<Category[]>(ENDPOINTS.programs, { retries: 0 }),
// };
