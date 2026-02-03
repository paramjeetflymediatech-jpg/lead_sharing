import { getCurrentUser } from "@/lib/serverAuth";
import DashboardLayout from "../components/DashboardLayout";

export default async function JobsLayout({ children }) {
    const user = await getCurrentUser();

    // Only apply dashboard layout for homeowners
    if (user && user.role === "HOMEOWNER") {
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

    // For other users (admins, guests, tradespeople), just render children
    // or you could add different layouts for them if needed
    return <>{children}</>;
}
