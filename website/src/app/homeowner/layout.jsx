import { getCurrentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

export default async function HomeownerLayout({ children }) {
    const user = await getCurrentUser();

    if (!user || user.role !== "HOMEOWNER") {
        redirect("/auth/login");
    }

    const navItems = [
        { name: "Dashboard", href: "/homeowner", icon: "HomeIcon" },
        { name: "My Posted Jobs", href: "/homeowner/jobs", icon: "BriefcaseIcon" },
        { name: "Post New Job", href: "/jobs", icon: "PlusCircleIcon" },
        { name: "Messages", href: "/homeowner/messages", icon: "ChatBubbleBottomCenterTextIcon" },
        { name: "Settings", href: "/homeowner/profile", icon: "UserIcon" },
    ];

    return (
        <DashboardLayout navItems={navItems} user={user}>
            {children}
        </DashboardLayout>
    );
}
