import React from 'react';
import WriteReview from "@/src/app/components/modules/account/write-review/components/WriteReview";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Write a Review',
};

const Page = () => {
    return (
        <div>
            <WriteReview/>
        </div>
    );
};

export default Page;