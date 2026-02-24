import { getCurrentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function TradespersonLayout({ children }) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "TRADESPERSON") {
            redirect("/auth/login");
        }

        const headersList = await headers();
        const pathname = headersList.get("x-pathname") || "";

        // Fetch tradesperson profile
        const { TradespersonProfile } = await import("@/models/TradespersonProfile");
        const profile = await TradespersonProfile.findOne({ user: user.id });

        if (profile && profile.profileImage) {
            user.profileImage = profile.profileImage;
        }

        const isApproved = profile?.verificationStatus === "APPROVED";

        console.log(`[TradespersonLayout] Path: ${pathname}, Approved: ${isApproved}`);

        // 1. Core Redirection Logic: If not approved -> Redirect to root-level onboarding
        if (!isApproved) {
            console.log("[TradespersonLayout] REDIRECTING to /onboarding (not approved)");
            redirect("/onboarding");
        }

        // 2. Navigation Items
        const navItems = [
            { name: "Explore Jobs", href: "/tradesperson", icon: "HomeIcon" },
            { name: "My Unlocked Leads", href: "/tradesperson/leads", icon: "ClipboardDocumentListIcon" },
            { name: "My Messages", href: "/tradesperson/messages", icon: "ChatBubbleBottomCenterTextIcon" },
            { name: "My Profile", href: "/tradesperson/profile", icon: "UserIcon" },
            { name: "Ratings", href: "/tradesperson/ratings", icon: "StarIcon" },
            { name: "My Account", href: "/tradesperson/account", icon: "Cog6ToothIcon" },
            { name: "Help", href: "/tradesperson/help", icon: "QuestionMarkCircleIcon" },
        ];

        return (
            <DashboardLayout navItems={navItems} user={user}>
                {children}
            </DashboardLayout>
        );
    } catch (error) {
        if (error.digest?.startsWith("NEXT_REDIRECT")) throw error;
        console.error("[TradespersonLayout] ERROR:", error);
        return (
            <div className="p-8 text-center">
                <h1 className="text-red-600 font-bold">Error Loading Dashboard</h1>
                <p className="mt-2 text-zinc-500">{error.message}</p>
            </div>
        );
    }
}
