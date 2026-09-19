export const SHIPPING_RATES: Record<string, number> = {
    "Phnom Penh": 1.5,
};

export const DEFAULT_SHIPPING = 2;

export function getShippingCharge(province: string | undefined | null): number {
    if (!province) return DEFAULT_SHIPPING;
    return SHIPPING_RATES[province] ?? DEFAULT_SHIPPING;
}