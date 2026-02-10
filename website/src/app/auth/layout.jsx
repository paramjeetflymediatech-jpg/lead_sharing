"use client";

import Header from "../components/header/page";
import Footer from "../components/footer/page";

export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#000000]">
            <Header />
            {children}
            
            <Footer />
        </div>
    );
}
