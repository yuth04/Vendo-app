import React from 'react';
import CheckoutView from "@/src/app/components/modules/checkout/ CheckoutView";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Proceed to checkout',
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-10">
            <CheckoutView />
        </div>
    );
};

export default Page;