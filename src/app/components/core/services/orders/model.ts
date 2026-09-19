export interface OrderPayment {
    method: string;
    status: string;
    reference: string;
    paid_at: string | null;
}

export interface OrderAddress {
    first_name: string;
    last_name: string;
    address_line: string;
    city: string;
    province: string;
    phone: string;
    note: string | null;
}

export interface OrderItem {
    id: number;
    quantity: number;
    discount: number;
    subtotal: number;
    variant: {
        id: number;
        size: string;
        color: string;
        price: number;
        discount_price: number | null;
        product: {
            id: number;
            name: string;
            slug: string;
            image: string;
        };
    };
}

export interface OrderCoupon {
    code: string | null;
    discount: number;
}

export interface Order {
    order_id: number;
    order_number: string;
    status: string;
    original_price: number;
    product_discount: number;
    sub_total_price: number;
    coupon_discount: number;
    shipping_fee: number;
    total_price: number;
    save: number;
    coupon: OrderCoupon;
    created_at: string;
    time: string;
    payment: OrderPayment;
    address: OrderAddress;
    items: OrderItem[];
    isReturn?: boolean;
}

export interface OrderHistoryResponse {
    message: string;
    orders: Order[];
}

//--- Return Models ---//
export interface ReturnOrderPayload {
    order_id: number;
    reason: string;
    note: string | null;
    order_item_id: number;
    quantity: number;
}

export interface ReturnProduct {
    product_id: number;
    name: string;
    price: number;
    discount_price: number;
    size: string;
    color: string;
    image: string | null;
}

export interface ReturnOrderItem {
    return_item_id: number;
    quantity: number;
    discount: number;
    subtotal: number;
    product: ReturnProduct;
}

export interface ReturnCustomer {
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
}

export interface ReturnAddress {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    address_line: string;
    city: string;
    province: string;
    phone: string;
    postal_code: string;
    is_default: boolean;
}

export interface ReturnOrder {
    return_id: number;
    order_id: number;
    status: string;
    order_number: string;
    reason: string;
    note: string | null;
    original_price: number;
    product_discount: number;
    sub_total_price: number;
    coupon_discount: number;
    shipping_fee: number;
    total_price: number;
    save: number;
    coupon: {
        code: string | null;
        discount: number;
    };
    created_at: string;
    image: string | null;
    payment: {
        payment_method: string;
        payment_status: string;
        reference: string;
        paid_at: string | null;
    };
    customer: ReturnCustomer;
    address: ReturnAddress;
    items: ReturnOrderItem[];
}

export interface ReturnOrderHistoryResponse {
    message: string;
    data: ReturnOrder[];
}

//---ApplyCoupon---//
export interface ApplyCouponPayload {
    code: string;
    items: {
        product_variant_id: number;
        quantity: number;
    }[];
}

export interface ApplyCouponResponse {
    message:     string;
    coupon:      string;
    subtotal:    number;
    discount:    number;
    shipping:    number;
    total_price: number;
}