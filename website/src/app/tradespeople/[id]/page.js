import TradespersonProfileDetail from "../../components/TradespersonProfileDetail";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return await getSeoMetadata(`/tradespeople/${id}`);
}

export default async function TradespersonProfilePage({ params }) {
    const { id } = await params;
    const path = `/tradespeople/${id}`;
    const schema = await getSeoSchema(path);

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <TradespersonProfileDetail profileId={id} />
        </>
    );
}
