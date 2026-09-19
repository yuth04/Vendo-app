import { BASE_URL } from './config';

export const ENDPOINTS = {
    /**---- favorite -----**/
    checkout:`${BASE_URL}/api/v1/checkout`,
    orders:`${BASE_URL}/api/v1/orders`,
    returnsorders: `${BASE_URL}/api/v1/return-orders`,
    applycoupon: `${BASE_URL}/api/v1/apply-coupon`,
};