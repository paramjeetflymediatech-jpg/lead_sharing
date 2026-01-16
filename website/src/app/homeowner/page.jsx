// import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/lib/serverAuth";

// export default async function HomeownerDashboard() {
//   const user = await getCurrentUser();
//   if (!user || user.role !== "HOMEOWNER") {
//     redirect("/auth/login");
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50">
//       <header className="border-b bg-white px-6 py-4 flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Homeowner dashboard</h1>
//         <div className="flex items-center gap-4 text-sm">
//           <span className="text-zinc-600">Signed in as {user.email}</span>
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

//       <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
//         <section>
//           <h2 className="text-base font-semibold mb-2">Post a job</h2>
//           <p className="text-sm text-zinc-600 mb-3">
//             Tell us what work you need done and where you’re based. Tradespeople will send you quotes.
//           </p>
//           <a
//             href="/homeowner/jobs/new"
//             className="inline-flex items-center rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
//           >
//             Post a new job
//           </a>
//         </section>

//         <section>
//           <h2 className="text-base font-semibold mb-2">Your jobs</h2>
//           <p className="text-sm text-zinc-600 mb-3">
//             Here you’ll see jobs you’ve posted, their status, and any quotes received.
//           </p>
//           <div className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
//             Job list UI coming soon.
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }




import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import Link from "next/link"; // Ensure this is imported at the top

export default async function HomeownerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOMEOWNER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#000000] transition-colors">
      {/* Sidebar / Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
  <div className="h-8 w-8 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
    L
  </div>
  <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
    Dashboard
  </h1>
</Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Homeowner</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 shadow-sm"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-black dark:text-white">Welcome back, {user.name || 'User'}!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your home projects and connect with professionals.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 uppercase">Active Jobs</p>
            <p className="text-3xl font-black text-black dark:text-white mt-1">0</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 uppercase">Quotes Received</p>
            <p className="text-3xl font-black text-black dark:text-white mt-1">0</p>
          </div>
          <div className="rounded-2xl bg-[#155DFC]/5 border border-[#155DFC]/20 p-6 shadow-sm">
            <p className="text-sm font-bold text-[#155DFC] uppercase">Account Status</p>
            <p className="text-3xl font-black text-[#155DFC] mt-1 italic">Verified</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Job List */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-black dark:text-white">Your Recent Postings</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 py-20 px-6 text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-4">📋</div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">No jobs posted yet</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs">
                Post your first job to start receiving quotes from local trusted tradespeople.
              </p>
              <a
                href="/homeowner/jobs/new"
                className="mt-6 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#155DFC]/20 transition-all hover:bg-[#1149c7] active:scale-95"
              >
                Post your first job
              </a>
            </div>
          </section>

          {/* Sidebar: Quick Actions */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-black p-8 text-white dark:bg-[#155DFC]">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-sm opacity-80 mb-6">Our support team is available 24/7 to help you find the right pro.</p>
              <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-100 transition-colors">
                Contact Support
              </button>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-bold text-black dark:text-white mb-4">Safety Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-[#155DFC]">✔</span> Always check trade certifications.
                </li>
                <li className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-[#155DFC]">✔</span> Don't pay the full amount upfront.
                </li>
                <li className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-[#155DFC]">✔</span> Use the internal chat for records.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}