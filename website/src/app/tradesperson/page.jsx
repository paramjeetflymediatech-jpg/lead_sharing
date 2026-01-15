import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Job } from "@/models/Job";
import TradespersonJobsList from "./TradespersonJobsList";

export default async function TradespersonDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TRADESPERSON") {
    redirect("/auth/login");
  }

  await connectToDatabase();
  const profile = await TradespersonProfile.findOne({ user: user.id }).lean();
  const openJobs = await Job.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const jobs = openJobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    location: job.location,
    createdAt: job.createdAt ? job.createdAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Tradesperson dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-600">
            {(profile && profile.companyName) || "Your business"} · Credits:{" "}
            <strong>
              {profile && typeof profile.credits === "number"
                ? profile.credits
                : 0}
            </strong>
          </span>
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

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <section>
          <h2 className="text-base font-semibold mb-2">Available jobs</h2>
          <p className="text-sm text-zinc-600 mb-3">
            Browse a few of the latest open jobs. Later we’ll add filters and
            location matching.
          </p>
          <TradespersonJobsList jobs={jobs} />
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Profile & leads</h2>
          <p className="text-sm text-zinc-600 mb-3">
            Here you’ll manage your profile, buy credits, and see unlocked
            leads.
          </p>
          <div className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            Profile / credits / leads UI coming soon.
          </div>
        </section>
      </main>
    </div>
  );
}
