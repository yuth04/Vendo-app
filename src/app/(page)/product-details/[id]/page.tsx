import React from 'react';
import ProductDetails from "@/src/app/components/modules/product-details/components/ProductDetails";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Product Details',
};
const Page = () => {
    return (
        <div>
            <ProductDetails/>
        </div>
    );
};

export default Page;