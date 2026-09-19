import React from "react"
import AccountSidebar from "@/src/app/components/modules/account/AccountSidebar"

export default function AccountsLayout({
                                           children,
                                       }: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-12">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-10">

                <div className="lg:w-1/4">
                    <AccountSidebar/>
                </div>

                <div className="lg:w-3/4 px-4 py-3 rounded-2xl shadow-sm bg-[var(--header-bg)] card-theme">
                    {children}
                </div>

            </div>
        </div>
    )
}