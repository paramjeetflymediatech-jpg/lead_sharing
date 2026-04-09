import MainLayout from "../main/layout";
import ContactSupportClient from "./_components/ContactSupportClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/contact-support");
}

export default async function ContactSupportPage() {
    const schema = await getSeoSchema("/contact-support");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <ContactSupportClient />
        </MainLayout>
    );
}
