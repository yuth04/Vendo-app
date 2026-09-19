import React from 'react';
import ChangePassword from "@/src/app/components/modules/account/password/components/ChangePassword";
import {Metadata} from "next";


export const metadata: Metadata = {
    title: 'Change Password',
};

const Page = () => {
    return (
        <div>
            <ChangePassword/>
        </div>
    );
};

export default Page;