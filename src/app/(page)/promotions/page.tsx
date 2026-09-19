import React from 'react';
import Promotions from "@/src/app/components/modules/promotions/components/Promotions";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Promotions",
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <Promotions/>
        </div>
    );
};

export default Page;