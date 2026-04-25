import MainLayout from "./main/layout";
import LeadsharingHome from "./components/LeadsharingHome";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await getSeoMetadata("/");
}

export default async function Home() {
  const schema = await getSeoSchema("/");

  return (
    <MainLayout>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <LeadsharingHome />
    </MainLayout>
  );
}

