"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    BriefcaseIcon,
    PlusIcon,
    PlusCircleIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleBottomCenterTextIcon,
    UserCircleIcon,
    UserIcon,
    CreditCardIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MagnifyingGlassPlusIcon,
    CurrencyDollarIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";

const REQUESTED_ICONS = {
    HomeIcon,
    BriefcaseIcon,
    PlusIcon,
    PlusCircleIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleBottomCenterTextIcon,
    UserCircleIcon,
    UserIcon,
    CreditCardIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MagnifyingGlassPlusIcon,
    CurrencyDollarIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon
};

export default function DashboardLayout({ children, navItems, user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold tracking-tight text-[#1149C7]">
                            Leadsharing
                        </Link>
                        <button className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg" onClick={toggleSidebar}>
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = REQUESTED_ICONS[item.icon] || HomeIcon; // Fallback to HomeIcon
                            if (item.href.includes("logout")) {
                                return (
                                    <form key={item.name} action={item.href} method="POST">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                            {item.name}
                                        </button>
                                    </form>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                    ${isActive
                                            ? "bg-[#1149C7] text-white shadow-lg shadow-[#1149C7]/20"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                        }
                  `}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer - User Profile (Mobile Only Context) */}
                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-4 lg:hidden">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                <UserCircleIcon className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.name || user?.email}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.role}</p>
                            </div>
                        </div>
                        <form action="/api/auth/logout" method="POST">
                            <button
                                type="submit"
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-20 bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                        onClick={toggleSidebar}
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>

                    <div className="flex-1 px-4 lg:px-0">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
                            Welcome Back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Badge */}
                        <button className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-[#1149C7] rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 relative">
                            <BellIcon className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                        </button>

                        {/* Desktop User Menu (Hidden on mobile) */}
                        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            <div className="text-right">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{user?.name || user?.email}</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1149C7] to-[#155DFC] p-[1px] shadow-lg shadow-[#1149C7]/20">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                    <UserCircleIcon className="w-6 h-6 text-zinc-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
}
