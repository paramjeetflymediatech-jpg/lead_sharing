import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/serverAuth";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";
import Job from "@/models/Job";
import { Category } from "@/models/Category";
import { SubCategory } from "@/models/SubCategory";
import JobDetailsClient from "./JobDetailsClient";

export default async function JobDetailsPage({ params }) {
  try {
    // Handle params properly in Next.js 15
    const { id } = await params;
    console.log("Job ID from params:", id);

    // Get user first and handle redirects properly
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/login");
      return null;
    }

    if (user.role !== "TRADESPERSON") {
      redirect("/auth/login");
      return null;
    }

    // Check if user._id exists, fallback to user.id
    const userId = user._id || user.id;
    if (!userId) {
      redirect("/auth/login");
      return null;
    }

    const profile = await TradespersonProfile.findOne({ user: userId });

    if (!profile) {
      redirect("/tradesperson/setup");
      return null;
    }

    // Validate the job ID - FIXED: Don't check isNaN for MySQL IDs
    if (!id) {
      console.error("Invalid job ID:", id);
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Job ID</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              The job ID format is invalid.
            </p>
            <Link
              href="/tradesperson"
              className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
            >
              Back to Dashboard /credits
            </Link>
          </div>
        </div>
      );
    }

    // Fetch job with full details - FIXED: Use findById for MySQL
    let job = await Job.findById(id);

    console.log("Raw job data:", job);

    if (job) {
      // Manually populate category and subcategory
      let category = null;
      let subCategory = null;

      // Check if category is already populated or just an ID
      if (job.category) {
        if (typeof job.category === 'object' && job.category._id) {
          // Already populated
          category = job.category;
        } else {
          // Need to fetch
          category = await Category.findOne({ _id: job.category });
        }
      }

      // Check if subCategory is already populated or just an ID
      if (job.subCategory) {
        if (typeof job.subCategory === 'object' && job.subCategory._id) {
          // Already populated
          subCategory = job.subCategory;
        } else {
          // Need to fetch
          subCategory = await SubCategory.findOne({ _id: job.subCategory });
        }
      }

      // Create a new job object with populated data
      job = {
        ...job,
        category: category || {},
        subCategory: subCategory || {},
        homeowner: job.homeowner || { name: "Homeowner" } // Use existing if available
      };
    }

    console.log("Fetched job with populated data:", job);

    if (!job) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Job ID: {id}<br />
              The job you're looking for doesn't exist or has been removed.
            </p>
            <div className="space-y-3">
              <Link
                href="/tradesperson"
                className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Check if user has unlocked this job - FIXED: Use MySQL-compatible queries
    const userLead = await Lead.findOne({
      job: id,
      tradesperson: userId,
      isUnlocked: true,
    });

    const hasUnlocked = !!userLead;

    // Get lead count - FIXED: Use count method
    const leadCount = await Lead.countDocuments({
      job: id,
      isUnlocked: true,
    });

    // Format functions (same as before)
    const formatBudget = (min, max) => {
      if (!min && !max) return "Budget not specified";
      if (min && max) return `$${min} - $${max}`;
      if (max) return `Up to $${max}`;
      if (min) return `From $${min}`;
      return "Budget not specified";
    };

    const formatStartTime = (startTime) => {
      const timeMap = {
        URGENT: "Urgent (within 24 hours)",
        WITHIN_2_DAYS: "Within 2 Days",
        WITHIN_2_WEEKS: "Within 2 Weeks",
        WITHIN_2_MONTHS: "Within 2 Months",
        FLEXIBLE: "Flexible/No Rush",
      };
      return timeMap[startTime] || startTime;
    };

    const formatJobStage = (stage) => {
      const stageMap = {
        PLANNING: "Planning Stage",
        READY_TO_START: "Ready to Start",
        URGENT: "Urgent/Immediate",
      };
      return stageMap[stage] || stage;
    };

    const formatOwnership = (ownership) => {
      const ownershipMap = {
        OWN: "Own Home",
        RENT: "Renting",
        LANDLORD: "Landlord",
        OTHER: "Other",
      };
      return ownershipMap[ownership] || ownership;
    };

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Helper function to detect if a URL is a video
    const isVideo = (url) => {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
      const videoPatterns = ['video/', 'youtube.com', 'youtu.be', 'vimeo.com'];

      const lowerUrl = url.toLowerCase();
      if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
        return true;
      }

      if (videoPatterns.some(pattern => lowerUrl.includes(pattern))) {
        return true;
      }

      return false;
    };

    // Helper function to render media
    const renderMedia = () => {
      if (!job.media || job.media.length === 0) {
        return (
          <div className="flex items-center justify-center h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-zinc-500">No media provided</p>
            </div>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {job.media.map((mediaItem, index) => {
            const url = mediaItem.url || "";

            if (isVideo(url)) {
              return (
                <div key={index} className="relative h-64 rounded-xl overflow-hidden group">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster={mediaItem.thumbnail || "/placeholder-video.jpg"}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold">
                    VIDEO
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="relative h-64 rounded-xl overflow-hidden group">
                <img
                  src={url || "/placeholder-image.jpg"}
                  alt={`Job media ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      );
    };

    // Prepare job object for client component (serialization)
    const safeJob = JSON.parse(JSON.stringify(job));

    // Parse media keys if they are strings (MySQL JSON/Text columns)
    if (safeJob.media && typeof safeJob.media === 'string') {
      try {
        safeJob.media = JSON.parse(safeJob.media);
      } catch (e) {
        console.error("Error parsing job media:", e);
        safeJob.media = [];
      }
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#000000]">
        {/* Header */}
        {/* <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-4 sm:px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/tradesperson" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
                L
              </div>
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Job Details
              </h1>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[#155DFC]/10 px-3 py-1.5 border border-[#155DFC]/20">
                <span className="text-xs font-bold text-[#155DFC]">
                  {leadCount}/3 leads
                </span>
              </div>
              <Link
                href="/tradesperson"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header> */}

        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/tradesperson" className="hover:text-[#155DFC]">
                Dashboard
              </Link>
              <span>›</span>
              <Link href="/tradesperson" className="hover:text-[#155DFC]">
                Jobs
              </Link>
              <span>›</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Job Details
              </span>
            </nav>
          </div>
        </div>

        <JobDetailsClient
          job={safeJob}
          leadCount={leadCount}
          hasUnlocked={hasUnlocked}
          profile={JSON.parse(JSON.stringify(profile))}
          user={JSON.parse(JSON.stringify(user))}
          lead={userLead ? JSON.parse(JSON.stringify(userLead)) : null}
        />
      </div>
    );
  } catch (error) {
    console.error("Job Details Error:", error);
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Job</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {error.message.includes("NEXT_REDIRECT")
              ? "You need to be logged in to view this page."
              : `Error: ${error.message || "Something went wrong while loading the job details"}`}
          </p>
          <Link
            href="/tradesperson"
            className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}














