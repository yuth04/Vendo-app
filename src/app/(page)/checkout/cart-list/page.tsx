import React from 'react';
import CartListView from "@/src/app/components/modules/checkout/CartListView";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Cart List',
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-10">
            <CartListView />
        </div>
    );
};

export default Page;