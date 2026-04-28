import MainLayout from "../../main/layout";
import ServiceDetailView from "../../components/ServiceDetailView";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";
import { Service } from "@/models/Service";

function formatLocation(slug) {
    if (!slug) return "";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export const dynamic = "force-dynamic";

async function getServiceData(slug) {
    // 1. Try to fetch from dynamic Services table
    try {
        const service = await Service.findOne({ slug: slug });
        if (service) {
            return {
                name: service.name,
                location: service.location || service.name.split(" in ")[1] || "Local Area", // Use explicit location if provided
                content: service.content || "",
                description: service.description,
                faq: service.faq || [],
                services: [], // Could be expanded later
                isDynamic: true
            };
        }
    } catch (error) {
        console.error("Error fetching service from DB:", error);
    }

    return null;
}

export async function generateMetadata({ params }) {
    const { location } = await params;
    const path = `/local-tradespeople/${location}`;
    
    const adminSeo = await getSeoMetadata(path);
    if (adminSeo && adminSeo.title !== 'AllCarePros Canada') {
        return adminSeo;
    }

    const data = await getServiceData(location);
    if (data?.seo) {
        return {
            title: data.seo.title,
            description: data.seo.description,
            keywords: data.seo.keywords,
        };
    }

    const formattedLocation = formatLocation(location);
    return {
        title: `Local Tradespeople in ${formattedLocation} | Leadsharing`,
        description: `Find reliable local tradespeople in ${formattedLocation}.`,
    };
}

export default async function LocationPage({ params }) {
    const { location } = await params;
    const path = `/local-tradespeople/${location}`;
    const serviceData = await getServiceData(location);
    
    const schema = await getSeoSchema(path);

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <ServiceDetailView location={location} initialData={serviceData} />
        </MainLayout>
    );
}
