import React from 'react';
import OrderHistory from "@/src/app/components/modules/account/order-history/OrderHistory";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Order Historys',
};

const Page = () => {
    return (
        <div>
            <OrderHistory/>
        </div>
    );
};

export default Page;