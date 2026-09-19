import React from 'react';
import Product from "@/src/app/components/modules/products/components/Product";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'All Products',
};
const Page = () => {
    console.log("🔥 Product rendering");
    return (
        <div>
            <Product/>
        </div>
    );
};

export default Page;