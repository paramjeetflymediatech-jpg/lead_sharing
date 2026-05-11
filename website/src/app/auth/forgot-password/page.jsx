import ForgotPasswordForm from "./_components/ForgotPasswordForm";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await getSeoMetadata("/auth/forgot-password");
}

export default async function ForgotPasswordPage() {
  const schema = await getSeoSchema("/auth/forgot-password");

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <ForgotPasswordForm />
    </>
  );
}