import MainLayout from "../../main/layout";
import ServiceDetailView from "../../components/ServiceDetailView";
import { TRADE_SERVICE_LINKS } from "@/constants/locations";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

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
    const path = `/local-tradespeople/${location}`;
    
    // 1. Try to get SEO from Admin Panel (supports patterns like /local-tradespeople/[location])
    const adminSeo = await getSeoMetadata(path);
    if (adminSeo && adminSeo.title !== 'AllCarePros Canada') {
        return adminSeo;
    }

    // 2. Fallback to hardcoded constants if no admin override exists
    const formattedLocation = formatLocation(location);
    let entry = null;
    let serviceMatch = null;

    for (const city of Object.values(TRADE_SERVICE_LINKS)) {
        if (city.location.toLowerCase() === formattedLocation.toLowerCase()) {
            entry = city;
            break;
        }
        serviceMatch = city.services.find(s => 
            (typeof s === 'string' ? s : s.name).toLowerCase() === formattedLocation.toLowerCase()
        );
        if (serviceMatch) {
            entry = typeof serviceMatch === 'string' ? city : serviceMatch;
            break;
        }
    }

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
    const path = `/local-tradespeople/${location}`;
    const locationName = formatLocation(location);
    
    // Get schema markup (could be from admin pattern match or global)
    const schema = await getSeoSchema(path);

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <ServiceDetailView location={locationName} />
        </MainLayout>
    );
}
