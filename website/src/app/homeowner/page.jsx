import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";

export default async function HomeownerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOMEOWNER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Homeowner dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-600">Signed in as {user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <section>
          <h2 className="text-base font-semibold mb-2">Post a job</h2>
          <p className="text-sm text-zinc-600 mb-3">
            Tell us what work you need done and where you’re based. Tradespeople will send you quotes.
          </p>
          <a
            href="/homeowner/jobs/new"
            className="inline-flex items-center rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Post a new job
          </a>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Your jobs</h2>
          <p className="text-sm text-zinc-600 mb-3">
            Here you’ll see jobs you’ve posted, their status, and any quotes received.
          </p>
          <div className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            Job list UI coming soon.
          </div>
        </section>
      </main>
    </div>
  );
}
