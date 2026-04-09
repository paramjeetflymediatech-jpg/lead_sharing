import { getCurrentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import { HomeIcon, UsersIcon, Squares2X2Icon, ListBulletIcon, BriefcaseIcon, MagnifyingGlassPlusIcon, CurrencyDollarIcon, Cog6ToothIcon, ChartBarIcon, ArrowTrendingUpIcon, DocumentTextIcon, ShieldCheckIcon, StarIcon, ChatBubbleLeftRightIcon, TrashIcon } from "@heroicons/react/24/outline";

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
        { name: "Payments", href: "/admin/payments", icon: "CurrencyDollarIcon" },
        { name: "Verifications", href: "/admin/verifications", icon: "ShieldCheckIcon" },
        { name: "Ratings", href: "/admin/ratings", icon: "StarIcon" },
        { name: "Deletion Requests", href: "/admin/deletion-requests", icon: "TrashIcon" },
        { name: "Contact Inquiries", href: "/admin/contact-requests", icon: "ChatBubbleLeftRightIcon" },
        { name: "SEO Management", href: "/admin/seo", icon: "ArrowTrendingUpIcon" },
        { name: "Blogs", href: "/admin/blogs", icon: "DocumentTextIcon" },
        { name: "Settings", href: "/admin/settings", icon: "Cog6ToothIcon" },
    ];

    return (
        <DashboardLayout navItems={navigation} user={user}>
            {children}
        </DashboardLayout>
    );
}
