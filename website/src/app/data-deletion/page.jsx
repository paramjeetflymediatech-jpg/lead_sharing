import DataDeletionClient from "./_components/DataDeletionClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/data-deletion");
}

export default async function DataDeletionPage() {
    const schema = await getSeoSchema("/data-deletion");

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <DataDeletionClient />
        </>
    );
}
