import type { ReactNode } from "react"
import Header from "@/src/app/components/layout/header/Header";
import Footer from "@/src/app/components/layout/footer/components/Footer"

export default function StoreLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}
