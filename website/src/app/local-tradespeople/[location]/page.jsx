import MainLayout from "../../main/layout";
import LeadsharingHome from "../../components/LeadsharingHome";
import { getSeoMetadata } from "@/lib/seo-helper";

function formatLocation(slug) {
    if (!slug) return "";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export async function generateMetadata({ params }) {
    const { location } = await params;
    const formattedLocation = formatLocation(location);
    const title = `Local Tradespeople in ${formattedLocation} | Leadsharing`;
    const description = `Find reliable local tradespeople in ${formattedLocation}. Post your job for free and get quotes from rated professionals in your area.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        },
    };
}

export default async function LocationPage({ params }) {
    const { location } = await params;
    const locationName = formatLocation(location);

    return (
        <MainLayout>
            <LeadsharingHome location={locationName} />
        </MainLayout>
    );
}
