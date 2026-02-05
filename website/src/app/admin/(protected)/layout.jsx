import { getCurrentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import { HomeIcon, UsersIcon, Squares2X2Icon, ListBulletIcon, BriefcaseIcon, MagnifyingGlassPlusIcon, CurrencyDollarIcon, Cog6ToothIcon, ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default async function AdminLayout({ children }) {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/auth/login");
    }

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: "HomeIcon" },
        { name: "Users", href: "/admin/users", icon: "UsersIcon" },
        { name: "Categories", href: "/admin/categories", icon: "Squares2X2Icon" },
        { name: "Subcategories", href: "/admin/subcategories", icon: "ListBulletIcon" },
        { name: "Jobs", href: "/admin/jobs", icon: "BriefcaseIcon" },
        { name: "Leads", href: "/admin/leads", icon: "MagnifyingGlassPlusIcon" },
        { name: "Revenue", href: "/admin/payments", icon: "CurrencyDollarIcon" },
        { name: "SEO Management", href: "/admin/seo", icon: "ArrowTrendingUpIcon" },
        { name: "Settings", href: "/admin/settings", icon: "Cog6ToothIcon" },
    ];

    return (
        <DashboardLayout navItems={navigation} user={user}>
            {children}
        </DashboardLayout>
    );
}
