import React from 'react';
import Orders from "@/src/app/components/modules/account/orders/components/Orders";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Order Details',
};

const Page = () => {
    return (
        <div>
            <Orders/>
        </div>
    );
};

export default Page;