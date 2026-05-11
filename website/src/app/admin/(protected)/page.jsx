import AdminDashboardClient from "./_components/AdminDashboardClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/admin");
}

export default async function AdminDashboard() {
    const schema = await getSeoSchema("/admin");

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <AdminDashboardClient />
        </>
    );
}
