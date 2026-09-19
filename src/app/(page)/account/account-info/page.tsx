import React from 'react';
import AccountInfo from "@/src/app/components/modules/account/account-info/components/AccountInfo";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Account Information',
};

const Page = () => {
    return (
        <div>
            <AccountInfo/>
        </div>
    );
};

export default Page;