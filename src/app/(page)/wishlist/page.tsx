import React from 'react';
import Wishlist from "@/src/app/components/modules/wishlist/components/Wishlist";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Wishlists',
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <Wishlist/>
        </div>
    );
};

export default Page;