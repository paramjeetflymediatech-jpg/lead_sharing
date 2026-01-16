// import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/lib/serverAuth";
// import { connectToDatabase } from "@/lib/mongodb";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import { Job } from "@/models/Job";
// import TradespersonJobsList from "./TradespersonJobsList";

// export default async function TradespersonDashboard() {
//   const user = await getCurrentUser();
//   if (!user || user.role !== "TRADESPERSON") {
//     redirect("/auth/login");
//   }

//   await connectToDatabase();
//   const profile = await TradespersonProfile.findOne({ user: user.id }).lean();
//   const openJobs = await Job.find({ status: "OPEN" })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .lean();

//   const jobs = openJobs.map((job) => ({
//     id: job._id.toString(),
//     title: job.title,
//     description: job.description,
//     location: job.location,
//     createdAt: job.createdAt ? job.createdAt.toISOString() : null,
//   }));

//   return (
//     <div className="min-h-screen bg-zinc-50">
//       <header className="border-b bg-white px-6 py-4 flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Tradesperson dashboard</h1>
//         <div className="flex items-center gap-4 text-sm">
//           <span className="text-zinc-600">
//             {(profile && profile.companyName) || "Your business"} · Credits:{" "}
//             <strong>
//               {profile && typeof profile.credits === "number"
//                 ? profile.credits
//                 : 0}
//             </strong>
//           </span>
//           <form action="/api/auth/logout" method="POST">
//             <button
//               type="submit"
//               className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100"
//             >
//               Log out
//             </button>
//           </form>
//         </div>
//       </header>

//       <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
//         <section>
//           <h2 className="text-base font-semibold mb-2">Available jobs</h2>
//           <p className="text-sm text-zinc-600 mb-3">
//             Browse a few of the latest open jobs. Later we’ll add filters and
//             location matching.
//           </p>
//           <TradespersonJobsList jobs={jobs} />
//         </section>

//         <section>
//           <h2 className="text-base font-semibold mb-2">Profile & leads</h2>
//           <p className="text-sm text-zinc-600 mb-3">
//             Here you’ll manage your profile, buy credits, and see unlocked
//             leads.
//           </p>
//           <div className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
//             Profile / credits / leads UI coming soon.
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }






import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-zinc-50 transition-colors dark:bg-[#000000]">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">ProDashboard</h1>
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tradesperson</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {(profile && profile.companyName) || user.name || "Business"}
              </p>
            </div>
            
            {/* Credit Badge */}
            <div className="flex items-center gap-2 rounded-full bg-[#155DFC]/10 px-3 py-1.5 border border-[#155DFC]/20">
              <span className="text-xs font-bold text-[#155DFC]">Credits: {profile?.credits ?? 0}</span>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white shadow-sm"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Section: Quick Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-black p-6 text-white dark:bg-[#155DFC] shadow-xl shadow-blue-500/10">
            <h3 className="text-sm font-bold opacity-70 uppercase tracking-wider">Available Credits</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black">{profile?.credits ?? 0}</span>
              <span className="text-xs opacity-60">Ready to use</span>
            </div>
            <button className="mt-4 w-full rounded-xl bg-white/20 py-2 text-xs font-bold backdrop-blur-md hover:bg-white/30 transition-all">
              Top Up Credits
            </button>
          </div>
          
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Leads</h3>
            <p className="mt-2 text-4xl font-black text-black dark:text-white">0</p>
            <p className="mt-1 text-xs text-zinc-500">Quotes sent this month</p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Profile Views</h3>
            <p className="mt-2 text-4xl font-black text-black dark:text-white">12</p>
            <p className="mt-1 text-xs text-zinc-500">Last 7 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Available Jobs */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-black dark:text-white">Latest Job Leads</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">New jobs matching your trade</p>
              </div>
              <Link href="/jobs" className="text-sm font-bold text-[#155DFC] hover:underline">
                View all leads →
              </Link>
            </div>
            
            <div className="rounded-3xl bg-white p-2 shadow-sm border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
              <TradespersonJobsList jobs={jobs} />
            </div>
          </section>

          {/* Sidebar: Business Growth */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">Complete your Profile</h3>
              <div className="space-y-4">
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                   <div className="h-full bg-[#155DFC] w-[65%]" />
                </div>
                <p className="text-xs text-zinc-500">Your profile is 65% complete. Add photos to get 2x more leads.</p>
                <button className="w-full rounded-xl border-2 border-[#155DFC] py-3 text-sm font-bold text-[#155DFC] hover:bg-[#155DFC] hover:text-white transition-all">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-900 p-6 dark:bg-zinc-800">
              <h3 className="font-bold text-white mb-2">Pro Tip</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Respond to leads within 30 minutes to increase your chance of winning the job by 40%.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}