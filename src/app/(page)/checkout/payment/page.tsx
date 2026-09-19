import React from 'react';
import PaymentView from "@/src/app/components/modules/checkout/PaymentView";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Payment',
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-10">
            <PaymentView />
        </div>
    );
};

export default Page;