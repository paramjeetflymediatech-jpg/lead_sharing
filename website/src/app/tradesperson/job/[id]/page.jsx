// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { getCurrentUser } from "@/lib/serverAuth";
// // import { connectToDatabase } from "@/lib/mongodb";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import { Lead } from "@/models/Lead";
// import Job from "@/models/Job";
// // import { isValidObjectId } from "mongoose";

// // Models
// import { Category } from "@/models/Category";
// import { SubCategory } from "@/models/SubCategory";
// import { User } from "@/models/User";

// export default async function JobDetailsPage({ params }) {
//   try {
//     // Handle params properly in Next.js 15
//     const { id } = await params;
//     console.log("Job ID from params:", id);

//     // Get user first and handle redirects properly
//     const user = await getCurrentUser();

//     if (!user) {
//       redirect("/auth/login");
//       return null;
//     }

//     if (user.role !== "TRADESPERSON") {
//       redirect("/auth/login");
//       return null;
//     }

//     // await connectToDatabase();

//     // Check if user._id exists, fallback to user.id
//     const userId = user._id || user.id;
//     if (!userId) {
//       redirect("/auth/login");
//       return null;
//     }

//     const profile = await TradespersonProfile.findOne({ user: userId });

//     if (!profile) {
//       redirect("/tradesperson/setup");
//       return null;
//     }

//     // Validate the job ID
//     if (!id || isNaN(Number(id))) {
//       console.error("Invalid job ID:", id);
//       return (
//         <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
//           <div className="text-center p-8">
//             <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Job ID</h1>
//             <p className="text-zinc-600 dark:text-zinc-400 mb-4">
//               The job ID format is invalid.
//             </p>
//             <Link
//               href="/tradesperson"
//               className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
//             >
//               Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       );
//     }

//     // Fetch job with full details
//     let job = await Job.findById(id);

//     if (job) {
//       // Manually proliferate
//       const category = await Category.findOne({ _id: job.category });
//       const subCategory = await SubCategory.findOne({ _id: job.subCategory });

//       job = {
//         ...job,
//         category: category || {},
//         subCategory: subCategory || {},
//         homeowner: { name: "Homeowner" } // Stub
//       };
//     }

//     console.log("Fetched job:", job ? "Found" : "Not found");

//     if (!job) {
//       return (
//         <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
//           <div className="text-center p-8">
//             <h1 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h1>
//             <p className="text-zinc-600 dark:text-zinc-400 mb-4">
//               Job ID: {id}<br />
//               The job you're looking for doesn't exist or has been removed.
//             </p>
//             <div className="space-y-3">
//               <Link
//                 href="/tradesperson"
//                 className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
//               >
//                 Back to Dashboard
//               </Link>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Check if user has unlocked this job
//     const lead = await Lead.findOne({
//       job: id,
//       tradesperson: profile._id,
//       isUnlocked: true,
//     });

//     const hasUnlocked = !!lead;

//     // Get lead count
//     const leadCount = await Lead.countDocuments({
//       job: id,
//       isUnlocked: true,
//     });

//     // Format functions
//     const formatBudget = (min, max) => {
//       if (!min && !max) return "Budget not specified";
//       if (min && max) return `£${min} - £${max}`;
//       if (max) return `Up to £${max}`;
//       if (min) return `From £${min}`;
//       return "Budget not specified";
//     };

//     const formatStartTime = (startTime) => {
//       const timeMap = {
//         URGENT: "Urgent (within 24 hours)",
//         WITHIN_2_DAYS: "Within 2 Days",
//         WITHIN_2_WEEKS: "Within 2 Weeks",
//         WITHIN_2_MONTHS: "Within 2 Months",
//         FLEXIBLE: "Flexible/No Rush",
//       };
//       return timeMap[startTime] || startTime;
//     };

//     const formatJobStage = (stage) => {
//       const stageMap = {
//         PLANNING: "Planning Stage",
//         READY_TO_START: "Ready to Start",
//         URGENT: "Urgent/Immediate",
//       };
//       return stageMap[stage] || stage;
//     };

//     const formatOwnership = (ownership) => {
//       const ownershipMap = {
//         OWN: "Own Home",
//         RENT: "Renting",
//         LANDLORD: "Landlord",
//         OTHER: "Other",
//       };
//       return ownershipMap[ownership] || ownership;
//     };

//     const formatDate = (date) => {
//       if (!date) return "N/A";
//       return new Date(date).toLocaleDateString("en-GB", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     };

//     // Helper function to detect if a URL is a video
//     const isVideo = (url) => {
//       if (!url) return false;
//       const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
//       const videoPatterns = ['video/', 'youtube.com', 'youtu.be', 'vimeo.com'];

//       // Check file extension
//       const lowerUrl = url.toLowerCase();
//       if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
//         return true;
//       }

//       // Check for video patterns in URL
//       if (videoPatterns.some(pattern => lowerUrl.includes(pattern))) {
//         return true;
//       }

//       return false;
//     };

//     // Helper function to detect if a URL is an image
//     const isImage = (url) => {
//       if (!url) return false;
//       const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
//       const lowerUrl = url.toLowerCase();
//       return imageExtensions.some(ext => lowerUrl.includes(ext));
//     };

//     // Helper function to get media type icon
//     const getMediaTypeIcon = (url) => {
//       if (isVideo(url)) {
//         return (
//           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         );
//       }
//       return null;
//     };

//     // Helper function to render media (both images and videos)
//     const renderMedia = () => {
//       if (!job.media || job.media.length === 0) {
//         return (
//           <div className="flex items-center justify-center h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
//             <div className="text-center">
//               <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               <p className="mt-2 text-sm text-zinc-500">No media provided</p>
//             </div>
//           </div>
//         );
//       }

//       return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {job.media.map((mediaItem, index) => {
//             const url = mediaItem.url || "";

//             if (isVideo(url)) {
//               return (
//                 <div key={index} className="relative h-64 rounded-xl overflow-hidden group">
//                   {/* Video Player */}
//                   <video
//                     src={url}
//                     className="w-full h-full object-cover"
//                     controls
//                     preload="metadata"
//                     poster={mediaItem.thumbnail || "/placeholder-video.jpg"}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
//                   <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold">
//                     VIDEO
//                   </div>
//                 </div>
//               );
//             }

//             // Default to image if not a video
//             return (
//               <div key={index} className="relative h-64 rounded-xl overflow-hidden group">
//                 {/* Simple img tag for images */}
//                 <img
//                   src={url || "/placeholder-image.jpg"}
//                   alt={`Job media ${index + 1}`}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                   loading="lazy"
//                 />
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
//               </div>
//             );
//           })}
//         </div>
//       );
//     };

//     return (
//       <div className="min-h-screen bg-zinc-50 dark:bg-[#000000]">
//         {/* Header */}
//         <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-4 sm:px-6 py-4">
//           <div className="mx-auto flex max-w-7xl items-center justify-between">
//             <Link href="/tradesperson" className="flex items-center gap-2">
//               <div className="h-8 w-8 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
//                 L
//               </div>
//               <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
//                 Job Details
//               </h1>
//             </Link>

//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2 rounded-full bg-[#155DFC]/10 px-3 py-1.5 border border-[#155DFC]/20">
//                 <span className="text-xs font-bold text-[#155DFC]">
//                   {leadCount}/3 leads
//                 </span>
//               </div>
//               <Link
//                 href="/tradesperson"
//                 className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
//               >
//                 Back to Dashboard
//               </Link>
//             </div>
//           </div>
//         </header>

//         <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
//           {/* Breadcrumb */}
//           <div className="mb-6">
//             <nav className="flex items-center gap-2 text-sm text-zinc-500">
//               <Link href="/tradesperson" className="hover:text-[#155DFC]">
//                 Dashboard
//               </Link>
//               <span>›</span>
//               <Link href="/tradesperson" className="hover:text-[#155DFC]">
//                 Jobs
//               </Link>
//               <span>›</span>
//               <span className="font-medium text-zinc-700 dark:text-zinc-300">
//                 Job Details
//               </span>
//             </nav>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Main Content */}
//             <div className="lg:col-span-2 space-y-8">
//               {/* Job Header */}
//               <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
//                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
//                   <div>
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
//                         {job.category?.name || "Unknown Category"}
//                       </span>
//                       <span className="text-xs text-zinc-400">•</span>
//                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
//                         {job.subCategory?.name || "Unknown Type"}
//                       </span>
//                     </div>
//                     <h1 className="text-2xl font-extrabold text-black dark:text-white mb-2">
//                       {job.category?.name} - {job.subCategory?.name}
//                     </h1>
//                     <div className="flex items-center gap-3 text-sm text-zinc-500">
//                       <span>Posted {formatDate(job.createdAt)}</span>
//                       <span>•</span>
//                       <span className={`font-bold ${job.status === "OPEN" ? "text-green-600" : "text-red-600"}`}>
//                         {job.status}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Lead Status Badge */}
//                   <div className={`px-4 py-2 rounded-full text-sm font-bold ${!hasUnlocked
//                       ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
//                       : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
//                     }`}>
//                     {hasUnlocked ? "✓ You've unlocked this lead" : `${leadCount}/3 leads unlocked`}
//                   </div>
//                 </div>

//                 {/* Job Description */}
//                 <div className="mb-6">
//                   <h2 className="text-lg font-bold text-black dark:text-white mb-3">Job Description</h2>
//                   <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
//                     <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
//                       {job.description || "No description provided"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Media Section */}
//                 <div className="mb-6">
//                   <h2 className="text-lg font-bold text-black dark:text-white mb-3">Job Media</h2>
//                   {renderMedia()}
//                 </div>

//                 {/* Key Details Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
//                     <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Location Details</h3>
//                     <div className="space-y-2">
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                         <span className="font-semibold">Postcode:</span> {job.location?.postcode || "Not specified"}
//                       </p>
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                         </svg>
//                         <span className="font-semibold">City:</span> {job.location?.city || "Not specified"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
//                     <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Timing & Stage</h3>
//                     <div className="space-y-2">
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span className="font-semibold">Start Time:</span> {formatStartTime(job.startTime)}
//                       </p>
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//                         </svg>
//                         <span className="font-semibold">Job Stage:</span> {formatJobStage(job.jobStage)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
//                     <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Budget</h3>
//                     <div className="space-y-2">
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span className="font-semibold">Budget Range:</span> {formatBudget(job.budgetMin, job.budgetMax)}
//                       </p>
//                       {job.budgetMin && job.budgetMax && (
//                         <p className="text-xs text-zinc-500 mt-1">
//                           Average: £{Math.round((job.budgetMin + job.budgetMax) / 2)}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
//                     <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Property Details</h3>
//                     <div className="space-y-2">
//                       <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                         </svg>
//                         <span className="font-semibold">Ownership:</span> {formatOwnership(job.ownership)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Category Details */}
//                 {(job.category?.description || job.subCategory?.description) && (
//                   <div className="mt-6">
//                     <h2 className="text-lg font-bold text-black dark:text-white mb-3">Service Information</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {job.category?.description && (
//                         <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
//                           <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">About {job.category?.name}</h3>
//                           <p className="text-sm text-blue-600 dark:text-blue-400">
//                             {job.category.description}
//                           </p>
//                         </div>
//                       )}
//                       {job.subCategory?.description && (
//                         <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
//                           <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">About {job.subCategory?.name}</h3>
//                           <p className="text-sm text-green-600 dark:text-green-400">
//                             {job.subCategory.description}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               {/* Contact Details (Only if unlocked) */}
//               {hasUnlocked ? (
//                 <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 border-2 border-green-200 dark:border-green-800">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
//                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Homeowner Contact</h3>
//                       <p className="text-sm text-green-700 dark:text-green-300">You have access to contact details</p>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Name</p>
//                       <p className="text-base font-semibold text-green-900 dark:text-green-100">
//                         {job.contactName || "Not provided"}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Email</p>
//                       <a
//                         href={`mailto:${job.contactEmail}`}
//                         className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline break-all"
//                       >
//                         {job.contactEmail || "Not provided"}
//                       </a>
//                     </div>

//                     <div>
//                       <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Phone</p>
//                       <a
//                         href={`tel:${job.contactPhone}`}
//                         className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline"
//                       >
//                         {job.contactPhone || "Not provided"}
//                       </a>
//                     </div>

//                     <div className="pt-4 space-y-3">
//                       <a
//                         href={`tel:${job.contactPhone}`}
//                         className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                         </svg>
//                         Call Homeowner
//                       </a>

//                       <a
//                         href={`mailto:${job.contactEmail}?subject=Regarding your ${job.category?.name || "job"} request&body=Hi ${job.contactName || "there"},%0D%0A%0D%0AI saw your job posting for ${job.category?.name || ""} - ${job.subCategory?.name || ""} and would like to discuss it further.%0D%0A%0D%0ABest regards,%0D%0A${profile.companyName || user.name || "Tradesperson"}`}
//                         className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-green-600 px-4 py-3 text-sm font-bold text-green-600 hover:bg-green-50 transition-all"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                         </svg>
//                         Send Email
//                       </a>
//                     </div>
//                   </div>

//                   {lead && (
//                     <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
//                       <h4 className="text-sm font-bold text-green-700 dark:text-green-300 mb-2">Your Message</h4>
//                       <div className="bg-white/50 dark:bg-black/30 p-3 rounded-xl">
//                         <p className="text-sm text-green-900 dark:text-green-100 italic">
//                           "{lead.message || "No message provided"}"
//                         </p>
//                         <p className="text-xs text-green-700 dark:text-green-300 mt-2">
//                           <span className="font-bold">Your Estimate:</span> {lead.priceEstimate || "Not provided"}
//                         </p>
//                       </div>
//                       <p className="text-xs text-green-600 dark:text-green-400 mt-2">
//                         Sent on {formatDate(lead.createdAt)}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-2 border-blue-200 dark:border-blue-800">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
//                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Unlock This Lead</h3>
//                       <p className="text-sm text-blue-700 dark:text-blue-300">Get homeowner contact details</p>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <p className="text-sm text-blue-600 dark:text-blue-400">
//                       {leadCount === 0
//                         ? "Be the first to unlock this lead!"
//                         : `${leadCount} tradesperson${leadCount !== 1 ? 's' : ''} already unlocked this lead`}
//                     </p>

//                     <div className="bg-white/50 dark:bg-black/30 p-4 rounded-xl">
//                       <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">What you get:</p>
//                       <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
//                         <li className="flex items-center gap-2">
//                           <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                           </svg>
//                           Homeowner's name, email & phone
//                         </li>
//                         <li className="flex items-center gap-2">
//                           <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                           </svg>
//                           Direct communication access
//                         </li>
//                         <li className="flex items-center gap-2">
//                           <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                           </svg>
//                           Early advantage over competitors
//                         </li>
//                       </ul>
//                     </div>

//                     <Link
//                       href={`/tradesperson/unlock/${id}`}
//                       className="block w-full text-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
//                     >
//                       Unlock Lead (1 Credit)
//                     </Link>

//                     <p className="text-xs text-blue-500 text-center">
//                       {3 - leadCount} spot{3 - leadCount !== 1 ? 's' : ''} remaining
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Quick Stats */}
//               <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900 p-6">
//                 <h3 className="text-lg font-bold text-black dark:text-white mb-4">Job Statistics</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Lead Status</p>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
//                         {leadCount}/3 leads unlocked
//                       </span>
//                       <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-green-500"
//                           style={{ width: `${(leadCount / 3) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Posted</p>
//                     <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
//                       {formatDate(job.createdAt)}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Job ID</p>
//                     <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
//                       {job._id.toString().slice(-8)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="space-y-3">
//                 <Link
//                   href="/tradesperson"
//                   className="block w-full text-center rounded-xl border-2 border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
//                 >
//                   ← Back to Jobs
//                 </Link>

//                 {hasUnlocked && (
//                   <Link
//                     href="/tradesperson/leads"
//                     className="block w-full text-center rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
//                   >
//                     View All Your Leads
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   } catch (error) {
//     console.error("Job Details Error:", error);
//     return (
//       <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
//         <div className="text-center p-8">
//           <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Job</h1>
//           <p className="text-zinc-600 dark:text-zinc-400 mb-4">
//             {error.message.includes("NEXT_REDIRECT")
//               ? "You need to be logged in to view this page."
//               : `Error: ${error.message || "Something went wrong while loading the job details"}`}
//           </p>
//           <Link
//             href="/tradesperson"
//             className="inline-block px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90 transition-all"
//           >
//             Back to Dashboard
//           </Link>
//         </div>
//       </div>
//     );
//   }
// }




import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/serverAuth";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";
import Job from "@/models/Job";
import { Category } from "@/models/Category";
import { SubCategory } from "@/models/SubCategory";

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
              Back to Dashboard
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
    const lead = await Lead.findOne({
      job: id,
      tradesperson: profile._id,
      isUnlocked: true,
    });

    const hasUnlocked = !!lead;

    // Get lead count - FIXED: Use count method
    const leadCount = await Lead.countDocuments({
      job: id,
      isUnlocked: true,
    });

    // Format functions (same as before)
    const formatBudget = (min, max) => {
      if (!min && !max) return "Budget not specified";
      if (min && max) return `£${min} - £${max}`;
      if (max) return `Up to £${max}`;
      if (min) return `From £${min}`;
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

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#000000]">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-4 sm:px-6 py-4">
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
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header */}
              <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
                        {job.category?.name || "Unknown Category"}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {job.subCategory?.name || "Unknown Type"}
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-black dark:text-white mb-2">
                      {job.category?.name} - {job.subCategory?.name}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span>Posted {formatDate(job.createdAt)}</span>
                      <span>•</span>
                      <span className={`font-bold ${job.status === "OPEN" ? "text-green-600" : "text-red-600"}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Lead Status Badge */}
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${!hasUnlocked
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}>
                    {hasUnlocked ? "✓ You've unlocked this lead" : `${leadCount}/3 leads unlocked`}
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white mb-3">Job Description</h2>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {job.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Media Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white mb-3">Job Media</h2>
                  {renderMedia()}
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Location Details</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold">Postcode:</span> {job.location?.postcode || "Not specified"}
                      </p>
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold">City:</span> {job.location?.city || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Timing & Stage</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Start Time:</span> {formatStartTime(job.startTime)}
                      </p>
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="font-semibold">Job Stage:</span> {formatJobStage(job.jobStage)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Budget</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Budget Range:</span> {formatBudget(job.budgetMin, job.budgetMax)}
                      </p>
                      {job.budgetMin && job.budgetMax && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Average: £{Math.round((job.budgetMin + job.budgetMax) / 2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Property Details</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-semibold">Ownership:</span> {formatOwnership(job.ownership)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Details */}
                {(job.category?.description || job.subCategory?.description) && (
                  <div className="mt-6">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-3">Service Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.category?.description && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">About {job.category?.name}</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {job.category.description}
                          </p>
                        </div>
                      )}
                      {job.subCategory?.description && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">About {job.subCategory?.name}</h3>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {job.subCategory.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Details (Only if unlocked) */}
              {hasUnlocked ? (
                <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Homeowner Contact</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">You have access to contact details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Name</p>
                      <p className="text-base font-semibold text-green-900 dark:text-green-100">
                        {job.contactName || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Email</p>
                      <a
                        href={`mailto:${job.contactEmail}`}
                        className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline break-all"
                      >
                        {job.contactEmail || "Not provided"}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase mb-1">Phone</p>
                      <a
                        href={`tel:${job.contactPhone}`}
                        className="text-base font-semibold text-green-900 dark:text-green-100 hover:underline"
                      >
                        {job.contactPhone || "Not provided"}
                      </a>
                    </div>

                    <div className="pt-4 space-y-3">
                      <a
                        href={`tel:${job.contactPhone}`}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Homeowner
                      </a>

                      <a
                        href={`mailto:${job.contactEmail}?subject=Regarding your ${job.category?.name || "job"} request&body=Hi ${job.contactName || "there"},%0D%0A%0D%0AI saw your job posting for ${job.category?.name || ""} - ${job.subCategory?.name || ""} and would like to discuss it further.%0D%0A%0D%0ABest regards,%0D%0A${profile.companyName || user.name || "Tradesperson"}`}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-green-600 px-4 py-3 text-sm font-bold text-green-600 hover:bg-green-50 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Email
                      </a>
                    </div>
                  </div>

                  {lead && (
                    <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                      <h4 className="text-sm font-bold text-green-700 dark:text-green-300 mb-2">Your Message</h4>
                      <div className="bg-white/50 dark:bg-black/30 p-3 rounded-xl">
                        <p className="text-sm text-green-900 dark:text-green-100 italic">
                          "{lead.message || "No message provided"}"
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          <span className="font-bold">Your Estimate:</span> {lead.priceEstimate || "Not provided"}
                        </p>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Sent on {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Unlock This Lead</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Get homeowner contact details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {leadCount === 0
                        ? "Be the first to unlock this lead!"
                        : `${leadCount} tradesperson${leadCount !== 1 ? 's' : ''} already unlocked this lead`}
                    </p>

                    <div className="bg-white/50 dark:bg-black/30 p-4 rounded-xl">
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">What you get:</p>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Homeowner's name, email & phone
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Direct communication access
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Early advantage over competitors
                        </li>
                      </ul>
                    </div>

                    <Link
                      href={`/tradesperson/unlock/${id}`}
                      className="block w-full text-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
                    >
                      Unlock Lead (1 Credit)
                    </Link>

                    <p className="text-xs text-blue-500 text-center">
                      {3 - leadCount} spot{3 - leadCount !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900 p-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-4">Job Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Lead Status</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {leadCount}/3 leads unlocked
                      </span>
                      <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(leadCount / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Posted</p>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Job ID</p>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                      {job._id.toString().slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/tradesperson"
                  className="block w-full text-center rounded-xl border-2 border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                >
                  ← Back to Jobs
                </Link>

                {hasUnlocked && (
                  <Link
                    href="/tradesperson/leads"
                    className="block w-full text-center rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
                  >
                    View All Your Leads
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
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














