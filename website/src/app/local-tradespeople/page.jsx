import MainLayout from "../main/layout";
import ServiceDirectory from "../components/ServiceDirectory";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/local-tradespeople");
}

export default async function DirectoryPage() {
    const schema = await getSeoSchema("/local-tradespeople");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <ServiceDirectory />
        </MainLayout>
    );
}
