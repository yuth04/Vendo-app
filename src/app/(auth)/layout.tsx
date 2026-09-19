import React from "react";
import Header from "@/src/app/components/layout/header/Header"
import Footer from "@/src/app/components/layout/footer/components/Footer"


export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <main className="">
                {children}
            </main>
            <Footer />
        </>
    )
}
