// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex w-full max-w-3xl flex-col items-center gap-8 py-16 px-6 bg-white dark:bg-black sm:items-start">
//         <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
//           Find trusted tradespeople in Canada
//         </h1>
//         <p className="text-zinc-600 dark:text-zinc-400 max-w-xl">
//           Post your job and get quotes from rated tradespeople, or join as a tradesperson to
//           buy leads and grow your business.
//         </p>
//         <div className="flex flex-col gap-4 sm:flex-row">
//           <a
//             href="/auth/register?role=HOMEOWNER"
//             className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800"
//           >
//             Get started as homeowner
//           </a>
//           <a
//             href="/auth/register?role=TRADESPERSON"
//             className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-50"
//           >
//             Join as tradesperson
//           </a>
//         </div>
//         <a
//           href="/auth/login"
//           className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
//         >
//           Already have an account? Log in
//         </a>
//       </main>
//     </div>
//   );
// }

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

