import MainLayout from "../main/layout";
import HelpClient from "./_components/HelpClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/help");
}

export default async function HelpPage() {
    const schema = await getSeoSchema("/help");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <HelpClient />
        </MainLayout>
    );
}
