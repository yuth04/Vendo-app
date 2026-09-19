import React from 'react';
import Categories from "@/src/app/components/modules/categories/components/Categories";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "All Categories",
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-6">
            <Categories/>
        </div>
    );
};

export default Page;