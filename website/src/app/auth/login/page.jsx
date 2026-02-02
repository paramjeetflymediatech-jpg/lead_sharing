import LoginForm from "./_components/LoginForm";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
  return await getSeoMetadata("/auth/login");
}

export default async function LoginPage() {
  const schema = await getSeoSchema("/auth/login");

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <LoginForm />
    </>
  );
}
