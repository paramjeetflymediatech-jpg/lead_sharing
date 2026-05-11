import BlogListingClient from "./_components/BlogListingClient";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/blog");
}

export default async function BlogListingPage() {
    const schema = await getSeoSchema("/blog");

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <BlogListingClient />
        </>
    );
}
