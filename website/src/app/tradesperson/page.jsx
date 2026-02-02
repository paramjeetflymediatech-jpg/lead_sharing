import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/serverAuth";
// import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";
import TradespersonJobsList from "./TradespersonJobsList";
import {
  UserCircle,
  Building,
  Phone,
  MapPin,
  Camera,
  Sparkles,
} from "lucide-react";

// Register schemas for population
import "@/models/Category";
import "@/models/SubCategory";
import "@/models/User";

export default async function TradespersonDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== "TRADESPERSON") {
    redirect("/auth/login");
  }

  // await connectToDatabase();

  // Fetch profile with all necessary fields
  const profile = await TradespersonProfile.findOne({ user: user.id });

  if (!profile) {
    redirect("/tradesperson/setup");
  }

  try {
    const Job = (await import("@/models/Job")).default;

    // Simplified - get jobs without populate
    const openJobs = await Job.find({ status: "OPEN" });

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

    // Calculate profile completion with image consideration
    const calculateProfileCompletion = () => {
      let completion = 15; // Base score

      // Field scoring
      if (profile.companyName?.trim()) completion += 10;
      if (profile.profileImage?.trim()) completion += 15; // Profile image weight
      if (profile.bio?.trim()) completion += 15;
      if (profile.phone?.trim()) completion += 10;
      if (profile.postcode?.trim()) completion += 10;
      if (profile.skills?.length > 0) completion += 15;
      if (profile.serviceAreas?.length > 0) completion += 10;


      return Math.min(completion, 100);
    };

    const profileCompletion = calculateProfileCompletion();
    const availableJobsCount = validJobs.filter((j) => j.canUnlock).length;

    // Helper function for initials
    const getInitials = (name) => {
      if (!name) return "BS";
      return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div className="space-y-8">
        {/* Welcome Section with Profile Image */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            {/* Profile Image Section */}
            <div className="relative group">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-lg">
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.companyName || user.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#155DFC] to-blue-400 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {getInitials(profile.companyName || user.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Image Upload/Edit Badge */}
              <Link
                href="/tradesperson/profile"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#155DFC] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1149C7] transition-all group-hover:scale-110"
                title="Edit profile image"
              >
                <Camera className="w-4 h-4 text-white" />
              </Link>
            </div>

            {/* Welcome Text */}
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
                Business Portal
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                Hello, <span className="text-[#155DFC] font-bold">{profile.companyName || user.name || "Business"}</span>! Here are your latest opportunities.
              </p>

              {/* Quick Profile Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.serviceAreas?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.serviceAreas[0]},</span>
                    {profile.serviceAreas.length > 1 && (
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        +{profile.serviceAreas.length - 1}
                      </span>
                    )}
                  </div>
                )}

                {profile.postcode && (
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <span>{profile.postcode}</span>
                  </div>
                )}

                {profile.skills?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{profile.skills.length} skill{profile.skills.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credits Section */}
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
            {/* Profile Completion Card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Profile Strength
                </h3>
                <span className="text-sm font-bold text-[#155DFC]">
                  {profileCompletion}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-4">
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-[#155DFC] to-blue-400 rounded-full transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>

                {/* Profile Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Profile Image</span>
                    <div className={`w-3 h-3 rounded-full ${profile.profileImage ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Company Name</span>
                    <div className={`w-3 h-3 rounded-full ${profile.companyName?.trim() ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Bio/Description</span>
                    <div className={`w-3 h-3 rounded-full ${profile.bio?.trim() ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Phone Number</span>
                    <div className={`w-3 h-3 rounded-full ${profile.phone?.trim() ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Postcode</span>
                    <div className={`w-3 h-3 rounded-full ${profile.postcode?.trim() ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Skills</span>
                    <div className={`w-3 h-3 rounded-full ${profile.skills?.length > 0 ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Service Areas</span>
                    <div className={`w-3 h-3 rounded-full ${profile.serviceAreas?.length > 0 ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  </div>

                </div>

                <Link
                  href="/tradesperson/profile"
                  className="block w-full rounded-xl bg-zinc-900 dark:bg-zinc-800 py-3 text-center text-sm font-bold text-white hover:bg-black dark:hover:bg-zinc-700 transition-all shadow-lg shadow-black/5"
                >
                  {profileCompletion < 80 ? "Complete Profile" : "Update Profile"}
                </Link>
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl" />
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                Pro Tip 💡
              </h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                {!profile.profileImage
                  ? "Add a professional profile image to increase trust by 65%."
                  : "Fast responses (within 30 mins) increase win rates by 40%. Keep your notification bell on!"
                }
              </p>
            </div>

            {/* Active Leads Card */}
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

            {/* Quick Profile Preview */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                Profile Preview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <Building className="w-5 h-5 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">
                      {profile.companyName || "Your Business"}
                    </h4>
                    <p className="text-xs text-zinc-500 mb-1">
                      {profile.user?.email || "No email"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {profile.skills?.length || 0} services • {profile.serviceAreas?.length || 0} areas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Credits</p>
                    <p className="font-bold text-zinc-900 dark:text-white">{profile.credits}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Profile</p>
                    <p className="font-bold text-zinc-900 dark:text-white">{profileCompletion}%</p>
                  </div>
                </div>

                <Link
                  href="/tradesperson/profile"
                  className="block text-center text-sm font-medium text-[#155DFC] hover:underline"
                >
                  View Full Profile →
                </Link>
              </div>
            </div>
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