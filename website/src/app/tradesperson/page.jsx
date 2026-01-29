import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/serverAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";
import TradespersonJobsList from "./TradespersonJobsList";

// Register schemas for population
import "@/models/Category";
import "@/models/SubCategory";
import "@/models/User";

export default async function TradespersonDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== "TRADESPERSON") {
    redirect("/auth/login");
  }

  await connectToDatabase();
  const profile = await TradespersonProfile.findOne({ user: user.id }).lean();

  if (!profile) {
    redirect("/tradesperson/setup");
  }

  try {
    const Job = (await import("@/models/Job")).default;

    const openJobs = await Job.find({ status: "OPEN" })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("homeowner", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Safely map jobs with null checks
    const jobsWithLeadInfo = await Promise.all(
      (openJobs || []).map(async (job) => {
        try {
          // Count total leads for this job
          const leadCount = await Lead.countDocuments({
            job: job._id,
            isUnlocked: true,
          });

          // Check if current tradesperson unlocked this job
          const myLead = await Lead.findOne({
            job: job._id,
            tradesperson: profile._id,
            isUnlocked: true,
          });
          const isUnlockedByMe = !!myLead;

          return {
            id: job._id?.toString() || "",
            category: job.category?.name || "Unknown Category",
            subCategory: job.subCategory?.name || "Unknown Type",
            description: job.description || "No description available",
            location: {
              postcode: job.location?.postcode || "",
              city: job.location?.city || "",
            },
            startTime: job.startTime || "FLEXIBLE",
            jobStage: job.jobStage || "PLANNING",
            ownership: job.ownership || "OWN",
            budgetMin: job.budgetMin || 0,
            budgetMax: job.budgetMax || 0,
            createdAt: job.createdAt ? job.createdAt.toISOString() : null,
            // Lead information
            leadCount: leadCount || 0,
            maxLeads: 3,
            isUnlockedByMe: isUnlockedByMe,
            canUnlock: (leadCount < 3) && !isUnlockedByMe,
          };
        } catch (error) {
          console.error("Error processing job:", job._id, error);
          return null;
        }
      })
    );

    // Filter out any failed job processing
    const validJobs = jobsWithLeadInfo.filter((job) => job !== null);

    // Get tradesperson's unlocked leads count
    const activeLeadsCount = await Lead.countDocuments({
      tradesperson: profile._id,
      isUnlocked: true,
    });

    // Get current month leads count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyLeadsCount = await Lead.countDocuments({
      tradesperson: profile._id,
      isUnlocked: true,
      createdAt: { $gte: startOfMonth },
    });

    // Calculate profile completion
    const calculateProfileCompletion = () => {
      let completion = 30;
      if (profile.companyName) completion += 15;
      if (profile.bio) completion += 15;
      if (profile.phone) completion += 10;
      if (profile.serviceAreas?.length > 0) completion += 15;
      if (profile.media?.length > 0) completion += 15;
      return Math.min(completion, 100);
    };

    const profileCompletion = calculateProfileCompletion();
    const availableJobsCount = validJobs.filter((j) => j.canUnlock).length;

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              Business Portal
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
              Hello, {profile.companyName || user.name || "Business"}! Here are your latest opportunities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-[#155DFC]/10 px-4 py-2 border border-[#155DFC]/20">
              <span className="text-sm font-bold text-[#155DFC]">
                {profile.credits ?? 0} Credits
              </span>
            </div>
            <Link
              href="/tradesperson/credits"
              className="px-5 py-2.5 bg-[#155DFC] text-white text-sm font-bold rounded-xl hover:bg-[#1149C7] transition-all shadow-lg shadow-blue-500/20"
            >
              Top Up
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-zinc-900 p-6 text-white dark:bg-[#155DFC] shadow-xl shadow-blue-500/10 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:blur-xl transition-all" />
            <h3 className="text-xs font-bold opacity-70 uppercase tracking-widest">
              Available Credits
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black">{profile.credits ?? 0}</span>
              <span className="text-xs opacity-60 font-bold uppercase tracking-widest leading-none">Ready</span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm group">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Active Leads
            </h3>
            <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white transition-transform group-hover:scale-105 origin-left">
              {activeLeadsCount}
            </p>
            <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-tight">
              {monthlyLeadsCount} this month
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm group">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Open Jobs
            </h3>
            <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-white transition-transform group-hover:scale-105 origin-left">
              {availableJobsCount}
            </p>
            <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-tight">New opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Available Jobs */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Available Jobs
                </h2>
                <Link
                  href="/tradesperson/leads"
                  className="text-sm font-bold text-[#155DFC] hover:underline"
                >
                  My Leads →
                </Link>
              </div>
              <div className="p-4">
                <TradespersonJobsList jobs={validJobs} profileId={profile._id.toString()} />
              </div>
            </div>
          </section>

          {/* Sidebar: Business Growth */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                Profile Growth
              </h3>
              <div className="space-y-4">
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800 p-0.5">
                  <div
                    className="h-full bg-[#155DFC] rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-500 font-medium">
                  Your business profile is <span className="font-bold text-zinc-900 dark:text-white">{profileCompletion}%</span> complete.
                </p>
                <Link
                  href="/tradesperson/profile/edit"
                  className="block w-full rounded-xl bg-zinc-900 dark:bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-black dark:hover:bg-zinc-700 transition-all shadow-lg shadow-black/5"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl" />
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                Pro Tip 💡
              </h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Fast responses (within 30 mins) increase win rates by 40%. Keep your notification bell on!
              </p>
            </div>

            {activeLeadsCount > 0 && (
              <div className="rounded-3xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-6">
                <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                  🎯 Active Leads
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium leading-relaxed mb-4">
                  You have {activeLeadsCount} unlocked lead{activeLeadsCount !== 1 ? "s" : ""}. Reach out now!
                </p>
                <Link
                  href="/tradesperson/leads"
                  className="block w-full rounded-xl bg-green-600 py-3 text-center text-sm font-bold text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                >
                  View My Leads
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {error.message || "Something went wrong"}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }
}