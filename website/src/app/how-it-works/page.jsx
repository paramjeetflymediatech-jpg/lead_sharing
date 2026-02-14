import MainLayout from "../main/layout";
import HowItWorksClient from "./_components/HowItWorksClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/how-it-works");
}

export default async function HowItWorksPage() {
    const schema = await getSeoSchema("/how-it-works");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <HowItWorksClient />
        </MainLayout>
    );
}
