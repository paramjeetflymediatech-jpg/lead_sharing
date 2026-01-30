import { getCurrentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

export default async function TradespersonLayout({ children }) {
    const user = await getCurrentUser();

    if (!user || user.role !== "TRADESPERSON") {
        redirect("/auth/login");
    }

    const navItems = [
        { name: "Explore Jobs", href: "/tradesperson", icon: "HomeIcon" },
        { name: "My Unlocked Leads", href: "/tradesperson/leads", icon: "ClipboardDocumentListIcon" },
        { name: "My Profile", href: "/tradesperson/profile", icon: "UserIcon" },
        { name: "My Account", href: "/tradesperson/account", icon: "Cog6ToothIcon" },
        { name: "Logout", href: "/auth/logout", icon: "ArrowRightOnRectangleIcon" },
        { name: "Settings", href: "/tradesperson/settings", icon: "Cog6ToothIcon" },
        { name: "Help", href: "/tradesperson/help", icon: "QuestionMarkCircleIcon" },
    ];

    return (
        <DashboardLayout navItems={navItems} user={user}>
            {children}
        </DashboardLayout>
    );
}
