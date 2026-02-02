import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/serverAuth";
// import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";

// Register schemas
import "@/models/Category";
import "@/models/SubCategory";
import "@/models/User";
import "@/models/Job";

export default async function MyLeadsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TRADESPERSON") {
    redirect("/auth/login");
  }

  // await connectToDatabase();
  const profile = await TradespersonProfile.findOne({ user: user.id });

  if (!profile) {
    redirect("/tradesperson/setup");
  }

  // Fetch all unlocked leads (simplified - no populate)
  const leads = await Lead.find({
    tradesperson: profile._id,
    isUnlocked: true,
  });

  const formatBudget = (min, max) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `£${min} - £${max}`;
    if (max) return `Up to £${max}`;
    if (min) return `From £${min}`;
    return "Budget not specified";
  };

  const formatStartTime = (startTime) => {
    const timeMap = {
      URGENT: "Urgent",
      WITHIN_2_DAYS: "Within 2 Days",
      WITHIN_2_WEEKS: "Within 2 Weeks",
      WITHIN_2_MONTHS: "Within 2 Months",
      FLEXIBLE: "Flexible",
    };
    return timeMap[startTime] || startTime;
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#000000]">
      {/* Header */}
      <header className="sticky top-0 z-[1] border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <Link href="/tradesperson" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-15 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
              Leads
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white hidden xs:block">
              My Leads
            </h1>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-[#155DFC]/10 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#155DFC]/20 whitespace-nowrap">
              <span className="text-[10px] sm:text-xs font-bold text-[#155DFC]">
                Credits: {profile.credits ?? 0}
              </span>
            </div>
            <Link
              href="/tradesperson"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] sm:text-xs font-bold text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white whitespace-nowrap"
            >
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-black dark:text-white mb-2">
            Your Unlocked Leads
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You have {leads.length} unlocked lead{leads.length !== 1 ? "s" : ""}
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              No unlocked leads yet
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Start unlocking job leads to see homeowner contact details here
            </p>
            <Link
              href="/tradesperson"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-bold text-white hover:bg-[#155DFC]/90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => (
              <div
                key={lead._id.toString()}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Lead Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
                        {lead.job?.category?.name || "Unknown Category"}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {lead.job?.subCategory?.name || "Unknown Type"}
                      </span>
                      <span className="ml-auto sm:ml-0 text-xs text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Unlocked
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      {lead.job?.category?.name || "Job"} - {lead.job?.subCategory?.name || "Service"}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Unlocked on {formatDate(lead.unlockedAt || lead.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {lead.job?.location?.postcode || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Budget
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatBudget(lead.job?.budgetMin, lead.job?.budgetMax)}
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Timeline
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatStartTime(lead.job?.startTime)}
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                      Your Estimate
                    </p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {lead.priceEstimate || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                    Job Description:
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    {lead.job?.description || "No description provided"}
                  </p>
                </div>

                {/* Your Message */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                    Your Message to Homeowner:
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                      "{lead.message || "No message provided"}"
                    </p>
                  </div>
                </div>

                {/* Contact Details - Highlighted Section */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900 dark:text-green-100 text-lg">
                        Homeowner Contact Details
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Contact the homeowner directly to discuss the job
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/50 dark:bg-black/30 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-2">
                        Name
                      </p>
                      <p className="text-base font-semibold text-green-900 dark:text-green-100">
                        {lead.job?.contactName || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-white/50 dark:bg-black/30 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-2">
                        Email
                      </p>
                      <a
                        href={`mailto:${lead.job?.contactEmail}`}
                        className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline break-all"
                      >
                        {lead.job?.contactEmail || "Not provided"}
                      </a>
                    </div>

                    <div className="bg-white/50 dark:bg-black/30 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-2">
                        Phone
                      </p>
                      <a
                        href={`tel:${lead.job?.contactPhone}`}
                        className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline"
                      >
                        {lead.job?.contactPhone || "Not provided"}
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`tel:${lead.job?.contactPhone}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Homeowner
                    </a>

                    <a
                      href={`mailto:${lead.job?.contactEmail}?subject=Regarding your ${lead.job?.category?.name || "job"} request&body=Hi ${lead.job?.contactName || "there"},%0D%0A%0D%0AI saw your job posting for ${lead.job?.category?.name || ""} - ${lead.job?.subCategory?.name || ""} and would like to discuss it further.%0D%0A%0D%0AMy message: ${lead.message || ""}%0D%0A%0D%0ABest regards,%0D%0A${profile.companyName || user.name || "Tradesperson"}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-green-600 px-6 py-3 text-sm font-bold text-green-600 hover:bg-green-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </a>

                    <Link
                      href="/tradesperson"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-6 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find More Jobs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}