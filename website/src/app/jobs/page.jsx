import { getCurrentUser } from "@/lib/serverAuth";
import CreateJobForm from "./CreateJobForm";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await getSeoMetadata("/jobs");
}

export default async function CreateJobPage() {
  const user = await getCurrentUser();
  const schema = await getSeoSchema("/jobs");

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <CreateJobForm user={JSON.parse(JSON.stringify(user))} />
    </>
  );
}
