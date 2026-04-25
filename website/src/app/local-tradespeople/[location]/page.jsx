import MainLayout from "../../main/layout";
import ServiceDetailView from "../../components/ServiceDetailView";
import { TRADE_SERVICE_LINKS } from "@/constants/locations";

function formatLocation(slug) {
    if (!slug) return "";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { location } = await params;
    const formattedLocation = formatLocation(location);

    // Find matching SEO data in TRADE_SERVICE_LINKS
    const entry = Object.values(TRADE_SERVICE_LINKS).find(loc => 
        loc.location.toLowerCase() === formattedLocation.toLowerCase() ||
        loc.services.some(s => s.toLowerCase() === formattedLocation.toLowerCase())
    );

    if (entry?.seo) {
        return {
            title: entry.seo.title,
            description: entry.seo.description,
            keywords: entry.seo.keywords,
            openGraph: {
                title: entry.seo.title,
                description: entry.seo.description,
            },
        };
    }

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
            <ServiceDetailView location={locationName} />
        </MainLayout>
    );
}
