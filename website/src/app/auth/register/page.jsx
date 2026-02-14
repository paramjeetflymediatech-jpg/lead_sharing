import RegisterForm from "./_components/RegisterForm";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await getSeoMetadata("/auth/register");
}

export default async function RegisterPage() {
  const schema = await getSeoSchema("/auth/register");

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <RegisterForm />
    </>
  );
}