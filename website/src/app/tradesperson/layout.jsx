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
    ];

    return (
        <DashboardLayout navItems={navItems} user={user}>
            {children}
        </DashboardLayout>
    );
}
