// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CurrencyDollarIcon,
//   UserCircleIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CheckCircleIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
//   StarIcon,
//   EyeIcon,
//   BriefcaseIcon,
//   ClockIcon,
//   ShieldCheckIcon,
// } from "@heroicons/react/24/outline";
// import {
//   CheckCircleIcon as CheckCircleSolid,
//   StarIcon as StarIconSolid,
// } from "@heroicons/react/24/solid";
// import { toast, Toaster } from "react-hot-toast";

// export default function JobDetailsPage() {
//   const router = useRouter();
//   const params = useParams();
//   const jobId = params?.jobId || params?.id;

//   const [job, setJob] = useState(null);
//   const [leads, setLeads] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [hiringInProgress, setHiringInProgress] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showHireModal, setShowHireModal] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(false);

//   // New states for tradesperson profile
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [selectedTradesperson, setSelectedTradesperson] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(false);

//   // Existing modal states
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [showRatePromptModal, setShowRatePromptModal] = useState(false);

//   const [notification, setNotification] = useState({
//     show: false,
//     type: "success",
//     title: "",
//     message: "",
//     icon: null,
//   });

//   // Fetch logged-in user
//   const fetchUser = useCallback(async () => {
//     try {
//       const res = await fetch("/api/me", {
//         credentials: "include",
//         cache: "no-store",
//       });

//       if (res.ok) {
//         const userData = await res.json();
//         setUser(userData);
//       } else {
//         setUser(null);
//         router.push("/auth/login");
//       }
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       setUser(null);
//     }
//   }, [router]);

//   // Fetch job details
//   const fetchJobDetails = useCallback(async () => {
//     if (!jobId) {
//       console.error("No jobId available");
//       return;
//     }

//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setJob(data.data || data);
//       } else {
//         console.error("Failed to fetch job details:", res.status);
//       }
//     } catch (error) {
//       console.error("Error fetching job:", error);
//     }
//   }, [jobId]);

//   // Fetch leads for this job
//   const fetchLeads = useCallback(async () => {
//     if (!jobId) {
//       console.error("No jobId available");
//       return;
//     }

//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/leads`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setLeads(Array.isArray(data) ? data : data.data || []);
//       } else {
//         console.error("Failed to fetch leads:", res.status);
//       }
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     }
//   }, [jobId]);

//   // Fetch tradesperson profile
//   const fetchTradespersonProfile = async (tradespersonId) => {
//     if (!tradespersonId) {
//       toast.error("No tradesperson ID provided");
//       return;
//     }

//     setProfileLoading(true);
//     try {
//       const res = await fetch(`/api/homeowner/tradesperson/${tradespersonId}`, {
//         credentials: 'include'
//       });

//       if (res.ok) {
//         const data = await res.json();
//         console.log("Profile data received:", data); // Debug log
//         if (data.success) {
//           setSelectedTradesperson(data.data);
//           setShowProfileModal(true);
//         } else {
//           toast.error(data.message || 'Failed to load profile');
//         }
//       } else {
//         toast.error('Failed to load profile');
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       toast.error('Error loading profile');
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!jobId) {
//       console.error("JobId is missing from params");
//       return;
//     }

//     const loadData = async () => {
//       setLoading(true);
//       await fetchUser();
//       await fetchJobDetails();
//       await fetchLeads();
//       setLoading(false);
//     };
//     loadData();
//   }, [jobId, fetchUser, fetchJobDetails, fetchLeads]);

//   // Show notification
//   const showNotification = (type, title, message) => {
//     setNotification({
//       show: true,
//       type,
//       title,
//       message,
//       icon: type === "success" ? CheckCircleSolid : ExclamationTriangleIcon,
//     });

//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, show: false }));
//     }, 5000);
//   };

//   // Handle hiring
//   const handleHire = async (leadId) => {
//     if (!jobId) {
//       showNotification("error", "Error", "Job ID is missing.");
//       return;
//     }

//     setHiringInProgress(true);
//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ leadId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         showNotification("success", "Success!", "Tradesperson hired successfully!");
//         await fetchJobDetails();
//         await fetchLeads();
//         setShowHireModal(false);
//         setSelectedLead(null);
//       } else {
//         showNotification("error", "Failed to Hire", data.message || "Failed to hire tradesperson.");
//       }
//     } catch (error) {
//       console.error("Error hiring tradesperson:", error);
//       showNotification("error", "Something Went Wrong", "An error occurred.");
//     } finally {
//       setHiringInProgress(false);
//     }
//   };

//   // Handle completion
//   const handleMarkAsCompleted = async () => {
//     if (!jobId || !user) {
//       toast.error("Please login to update job status");
//       return;
//     }

//     if (job.status !== 'HIRED') {
//       toast.error("Only HIRED jobs can be marked as completed");
//       return;
//     }

//     setShowCompleteModal(true);
//   };

//   const confirmCompletion = async () => {
//     setShowCompleteModal(false);
//     setUpdatingStatus(true);
//     const loadingToast = toast.loading("Updating job status...");

//     try {
//       const userId = user?._id || user?.id || user?.user?._id;

//       const res = await fetch(`/api/jobs/homeowner/${jobId}/status`, {
//         method: 'PUT',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-id': userId.toString(),
//           'x-user-role': 'HOMEOWNER'
//         },
//         body: JSON.stringify({ status: 'COMPLETED' })
//       });

//       const data = await res.json();
//       toast.dismiss(loadingToast);

//       if (res.ok) {
//         toast.success("✅ Job marked as completed!");
//         await fetchJobDetails();

//         setTimeout(() => {
//           if (job.hired_tradesperson_name || job.hiredTradespersonName) {
//             setShowRatePromptModal(true);
//           }
//         }, 1000);
//       } else {
//         toast.error(data.message || 'Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       toast.error('Something went wrong');
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const handleNavigateToRating = () => {
//     setShowRatePromptModal(false);
//     router.push(`/homeowner/jobs/${jobId}/rate`);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-GB", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       });
//     } catch (e) {
//       return "";
//     }
//   };

//   const formatStatus = (status) => {
//     const statusMap = {
//       OPEN: "Open",
//       HIRED: "Hired",
//       IN_PROGRESS: "In Progress",
//       COMPLETED: "Completed",
//       CANCELLED: "Cancelled",
//     };
//     return statusMap[status] || status;
//   };

//   const getStatusColor = (status) => {
//     const colorMap = {
//       OPEN: "text-green-600 bg-green-50 dark:bg-green-900/20",
//       HIRED: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
//       REJECTED: "text-red-600 bg-red-50 dark:bg-red-900/20",
//       IN_PROGRESS: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
//       COMPLETED: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
//     };
//     return colorMap[status] || "text-gray-600 bg-gray-50";
//   };

//   const hasBeenRated = job?.has_rated === 1 || job?.has_rated === true || job?.hasRated === 1 || job?.hasRated === true;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC] mx-auto"></div>
//           <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading job details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
//         <div className="text-center">
//           <p className="text-gray-600 dark:text-zinc-400">Job not found</p>
//           <Link href="/homeowner" className="text-[#155DFC] hover:underline mt-4 inline-block">
//             Back to Dashboard
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
//       <Toaster position="top-right" />

//       {/* Notification */}
//       {notification.show && (
//         <div className="fixed top-6 right-6 z-50 animate-fade-in">
//           <div className={`rounded-2xl shadow-2xl overflow-hidden min-w-[380px] ${notification.type === "success"
//             ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
//             : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800"
//             }`}>
//             <div className="p-4">
//               <div className="flex items-start gap-4">
//                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === "success" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
//                   }`}>
//                   {notification.type === "success" ? (
//                     <CheckCircleSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
//                   ) : (
//                     <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className={`text-lg font-black ${notification.type === "success" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
//                     }`}>
//                     {notification.title}
//                   </h3>
//                   <p className={`mt-1 ${notification.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
//                     }`}>
//                     {notification.message}
//                   </p>
//                 </div>
//                 <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
//                   <XMarkIcon className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
//                 <div className={`h-full ${notification.type === "success" ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"
//                   } animate-progress`}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link href="/homeowner" className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4">
//             <ArrowLeftIcon className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Job Details</h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">Manage quotes and hire professionals for your project</p>
//         </div>

//         {/* Action Banners */}
//         {job.status === 'HIRED' && (
//           <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//                 <div>
//                   <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Job In Progress</h3>
//                   <p className="text-sm text-yellow-600 dark:text-yellow-400">Has the work been completed? Mark this job as completed when finished.</p>
//                 </div>
//               </div>
//               <button onClick={handleMarkAsCompleted} disabled={updatingStatus} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
//                 {updatingStatus ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircleIcon className="w-4 h-4" />
//                     Mark as Completed
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {job.status === 'COMPLETED' && !hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
//           <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <StarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
//                 <div>
//                   <h3 className="font-semibold text-amber-800 dark:text-amber-300">Rate Your Experience</h3>
//                   <p className="text-sm text-amber-600 dark:text-amber-400">How was your experience with {job.hired_tradesperson_name || job.hiredTradespersonName}? Your feedback helps others.</p>
//                 </div>
//               </div>
//               <button onClick={handleNavigateToRating} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg">
//                 <StarIconSolid className="w-4 h-4" />
//                 Rate Tradesperson
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Job Information */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//               <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">
//                       {job.category_name || job.category?.name || "Job"}
//                     </p>
//                     <h2 className="text-3xl font-black text-white tracking-tight">
//                       {job.subcategory_name || job.subCategory?.name || "Details"}
//                     </h2>
//                   </div>
//                   <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(job.status)}`}>
//                     {formatStatus(job.status)}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
//                     <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{job.description || "No description provided"}</p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                         <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Location</p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">{job.city || job.location?.city || "N/A"}</p>
//                         <p className="text-sm text-gray-500 dark:text-zinc-500">{job.postcode || job.location?.postcode || ""}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
//                         <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Budget Range</p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           ${(job.budget_min || job.budgetMin || 0).toLocaleString()} - ${(job.budget_max || job.budgetMax || 0).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
//                         <CalendarIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Posted</p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">{formatDate(job.created_at || job.createdAt)}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
//                         <UserCircleIcon className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Quotes Received</p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">{leads.length} Professional{leads.length !== 1 ? "s" : ""}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-4 text-white shadow-xl shadow-blue-500/20">
//               <h3 className="text-lg font-black mb-2">Need Help?</h3>
//               <p className="text-sm text-blue-100 mb-4 leading-relaxed">Our team is here to assist you with your project</p>
//               <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">Contact Support</button>
//             </div>

//             {job.status === "HIRED" && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
//               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4">
//                 <div className="flex items-center gap-2 mb-4">
//                   <CheckCircleIcon className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-gray-900 dark:text-white">Hired Professional</h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-gray-700 dark:text-zinc-300 font-semibold">{job.hired_tradesperson_name || job.hiredTradespersonName || "Professional"}</p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500">Hired on {formatDate(job.hired_at || job.hiredAt)}</p>
//                 </div>
//               </div>
//             )}

//             {job.status === "COMPLETED" && !hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
//               <div className="rounded-3xl border p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
//                 <div className="flex items-center gap-2 mb-4">
//                   <StarIcon className="w-6 h-6 text-amber-600" />
//                   <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">Pending Rating</h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-sm text-amber-600 dark:text-amber-400">Please rate your experience to help others</p>
//                   <button onClick={handleNavigateToRating} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
//                     <StarIconSolid className="w-4 h-4" />
//                     Rate Now
//                   </button>
//                 </div>
//               </div>
//             )}

//             {job.status === "COMPLETED" && hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
//               <div className="rounded-3xl border p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
//                 <div className="flex items-center gap-2 mb-4">
//                   <StarIconSolid className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-green-900 dark:text-green-300">Rating Submitted</h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-sm text-green-600 dark:text-green-400">Thank you for rating this tradesperson!</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Leads Section */}
//         <div className="mt-8">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//             <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">Quotes Received ({leads.length})</h2>
//               <p className="text-gray-600 dark:text-zinc-400 mt-1">Review and compare quotes from professionals</p>
//             </div>

//             <div className="p-8">
//               {leads.length === 0 ? (
//                 <div className="text-center py-12">
//                   <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
//                   <p className="text-gray-600 dark:text-zinc-400 font-bold">No quotes received yet</p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">Professionals will send you quotes soon</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                   {leads.map((lead) => (
//                     <div key={lead.id || lead._id} className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
//                       <div className="flex flex-col lg:flex-row gap-6">
//                         {/* Professional Info */}
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between mb-4">
//                             <div className="flex items-center gap-4">
//                               <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
//                                 {(lead.tradesperson_name || lead.company_name || "P")[0]?.toUpperCase()}
//                               </div>
//                               <div>
//                                 <h3 className="text-xl font-black text-gray-900 dark:text-white">
//                                   {lead.tradesperson_name || lead.company_name || "Professional"}
//                                 </h3>
//                                 {lead.company_name && lead.tradesperson_name && (
//                                   <p className="text-sm text-gray-600 dark:text-zinc-400">{lead.company_name}</p>
//                                 )}
//                                 <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(lead.status)}`}>
//                                   {formatStatus(lead.status)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             {lead.phone && (
//                               <div className="flex items-center gap-3">
//                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                 <a href={`tel:${lead.phone}`} className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]">
//                                   {lead.phone}
//                                 </a>
//                               </div>
//                             )}
//                             {lead.email && (
//                               <div className="flex items-center gap-3">
//                                 <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                 <a href={`mailto:${lead.email}`} className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]">
//                                   {lead.email}
//                                 </a>
//                               </div>
//                             )}
//                           </div>

//                           {lead.message && (
//                             <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Quote Message</p>
//                               <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{lead.message}</p>
//                             </div>
//                           )}

//                           {lead.price_estimate && (
//                             <div className="mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Price Estimate</p>
//                               <p className="text-2xl font-black text-[#155DFC]">${lead.price_estimate}</p>
//                             </div>
//                           )}

//                           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
//                             <div>
//                               <span className="font-bold uppercase tracking-widest">Submitted:</span> {formatDate(lead.created_at || lead.createdAt)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col gap-3 items-center justify-center">
//                           {job.status === "OPEN" && lead.status !== "HIRED" && (
//                             <>
//                               <button
//                                 onClick={() => {
//                                   // Get tradesperson ID from lead
//                                   const tradespersonId = lead.tradesperson_id || lead.tradesperson?.id || lead.tradesperson?._id;
//                                   if (tradespersonId) {
//                                     fetchTradespersonProfile(tradespersonId);
//                                   } else {
//                                     toast.error("Unable to view profile - missing tradesperson ID");
//                                   }
//                                 }}
//                                 disabled={profileLoading}
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 flex items-center gap-2 w-full justify-center"
//                               >
//                                 <EyeIcon className="w-4 h-4" />
//                                 {profileLoading ? "Loading..." : "View Profile"}
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   setSelectedLead(lead);
//                                   setShowHireModal(true);
//                                 }}
//                                 className="px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 flex items-center gap-2 w-full justify-center"
//                               >
//                                 <CheckCircleIcon className="w-4 h-4" />
//                                 Hire Now
//                               </button>
//                             </>
//                           )}
//                           {lead.status === "HIRED" && (
//                             <div className="flex items-center gap-2 text-green-600 font-bold">
//                               <CheckCircleIcon className="w-6 h-6" />
//                               <span>Hired</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Hire Confirmation Modal */}
//       {showHireModal && selectedLead && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
//             <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
//               <h3 className="text-2xl font-black text-white">Confirm Hire</h3>
//             </div>
//             <div className="p-8">
//               <p className="text-gray-700 dark:text-zinc-300 mb-6 leading-relaxed">
//                 Are you sure you want to hire{" "}
//                 <span className="font-bold text-gray-900 dark:text-white">
//                   {selectedLead.tradesperson_name || selectedLead.company_name || "this professional"}
//                 </span>{" "}
//                 for this job? This action will mark all other quotes as rejected.
//               </p>
//               <div className="flex gap-4">
//                 <button
//                   onClick={() => { setShowHireModal(false); setSelectedLead(null); }}
//                   disabled={hiringInProgress}
//                   className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleHire(selectedLead.id || selectedLead._id)}
//                   disabled={hiringInProgress}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {hiringInProgress ? "Hiring..." : "Confirm Hire"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tradesperson Profile Modal - ENHANCED VERSION */}
//       {showProfileModal && selectedTradesperson && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-2xl font-black text-white">Professional Profile</h3>
//                 <button onClick={() => { setShowProfileModal(false); setSelectedTradesperson(null); }} className="text-white hover:text-blue-200">
//                   <XMarkIcon className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
//               {profileLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC]"></div>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {/* Profile Header */}
//                   <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
//                     <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg flex-shrink-0">
//                       {selectedTradesperson.name?.[0]?.toUpperCase() || selectedTradesperson.companyName?.[0]?.toUpperCase() || 'P'}
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="text-3xl font-black text-gray-900 dark:text-white">
//                         {selectedTradesperson.companyName || 'Professional'}
//                       </h4>
//                       <p className="text-gray-600 dark:text-zinc-400 mt-1 text-lg">{selectedTradesperson.name}</p>

//                       {/* Rating and Stats */}
//                       <div className="flex flex-wrap items-center gap-4 mt-4">
//                         <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
//                           <StarIconSolid className="w-6 h-6 text-amber-500" />
//                           <span className="font-black text-xl text-gray-900 dark:text-white">
//                             {selectedTradesperson.averageRating}
//                           </span>
//                           <span className="text-gray-500 dark:text-zinc-500 text-sm">
//                             ({selectedTradesperson.totalRatings} {selectedTradesperson.totalRatings === 1 ? 'review' : 'reviews'})
//                           </span>
//                         </div>

//                         <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
//                           <BriefcaseIcon className="w-5 h-5 text-blue-600" />
//                           <span className="font-bold text-gray-900 dark:text-white">
//                             {selectedTradesperson.completedJobs} jobs completed
//                           </span>
//                         </div>

//                         <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
//                           <CalendarIcon className="w-5 h-5 text-purple-600" />
//                           <span className="font-bold text-gray-900 dark:text-white">
//                             Member since {selectedTradesperson.memberSince}
//                           </span>
//                         </div>

//                         {selectedTradesperson.verified && (
//                           <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
//                             <ShieldCheckIcon className="w-5 h-5 text-green-600" />
//                             <span className="font-bold text-green-700 dark:text-green-400">
//                               Verified
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Additional Stats */}
//                       {selectedTradesperson.responseTime && (
//                         <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-zinc-400">
//                           <ClockIcon className="w-4 h-4" />
//                           <span className="text-sm">Typically responds {selectedTradesperson.responseTime}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Contact Info */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {selectedTradesperson.email && selectedTradesperson.email !== 'N/A' && (
//                       <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
//                         <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Email</p>
//                           <a href={`mailto:${selectedTradesperson.email}`} className="text-gray-900 dark:text-white font-medium hover:text-[#155DFC]">
//                             {selectedTradesperson.email}
//                           </a>
//                         </div>
//                       </div>
//                     )}

//                     {selectedTradesperson.phone && selectedTradesperson.phone !== 'Not provided' && (
//                       <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
//                         <PhoneIcon className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Phone</p>
//                           <a href={`tel:${selectedTradesperson.phone}`} className="text-gray-900 dark:text-white font-medium hover:text-[#155DFC]">
//                             {selectedTradesperson.phone}
//                           </a>
//                         </div>
//                       </div>
//                     )}

//                     {selectedTradesperson.postcode && selectedTradesperson.postcode !== 'Not specified' && (
//                       <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
//                         <MapPinIcon className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Location</p>
//                           <p className="text-gray-900 dark:text-white font-medium">
//                             {selectedTradesperson.postcode}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Skills & Services */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
//                       <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                         <BriefcaseIcon className="w-5 h-5 text-blue-600" />
//                         Skills & Expertise
//                       </h5>
//                       <div className="flex flex-wrap gap-2">
//                         {selectedTradesperson.skills && selectedTradesperson.skills.length > 0 && selectedTradesperson.skills[0] !== '' ? (
//                           selectedTradesperson.skills.map((skill, index) => (
//                             <span key={index} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
//                               {skill}
//                             </span>
//                           ))
//                         ) : (
//                           <p className="text-gray-500 dark:text-zinc-500 italic">General services</p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
//                       <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                         <MapPinIcon className="w-5 h-5 text-green-600" />
//                         Service Areas
//                       </h5>
//                       <div className="flex flex-wrap gap-2">
//                         {selectedTradesperson.serviceAreas && selectedTradesperson.serviceAreas.length > 0 && selectedTradesperson.serviceAreas[0] !== '' ? (
//                           selectedTradesperson.serviceAreas.map((area, index) => (
//                             <span key={index} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
//                               {area}
//                             </span>
//                           ))
//                         ) : (
//                           <p className="text-gray-500 dark:text-zinc-500 italic">Various locations</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bio */}
//                   {selectedTradesperson.bio && selectedTradesperson.bio !== 'No bio provided' && (
//                     <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-gray-200 dark:border-zinc-700">
//                       <h5 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                         <UserCircleIcon className="w-5 h-5 text-gray-600" />
//                         About
//                       </h5>
//                       <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                         {selectedTradesperson.bio}
//                       </p>
//                     </div>
//                   )}

//                   {/* Rating Distribution */}
//                   {selectedTradesperson.ratingDistribution && selectedTradesperson.totalRatings > 0 && (
//                     <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
//                       <h5 className="font-black text-gray-900 dark:text-white mb-4">Rating Breakdown</h5>
//                       <div className="space-y-2">
//                         {[5, 4, 3, 2, 1].map((stars) => {
//                           const count = selectedTradesperson.ratingDistribution?.[stars] || 0;
//                           const percentage = selectedTradesperson.totalRatings > 0
//                             ? (count / selectedTradesperson.totalRatings) * 100
//                             : 0;
//                           return (
//                             <div key={stars} className="flex items-center gap-3">
//                               <div className="flex items-center gap-1 w-20">
//                                 <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{stars}</span>
//                                 <StarIconSolid className="w-4 h-4 text-amber-500" />
//                               </div>
//                               <div className="flex-1 h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
//                                 <div
//                                   className="h-full bg-amber-500"
//                                   style={{ width: `${percentage}%` }}
//                                 ></div>
//                               </div>
//                               <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400 w-12 text-right">
//                                 {count}
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   {/* Reviews */}
//                   {selectedTradesperson.reviews && selectedTradesperson.reviews.length > 0 && (
//                     <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-gray-200 dark:border-zinc-700">
//                       <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                         <StarIconSolid className="w-5 h-5 text-amber-500" />
//                         Recent Reviews ({selectedTradesperson.reviews.length})
//                       </h5>
//                       <div className="space-y-6">
//                         {selectedTradesperson.reviews.map((review, index) => (
//                           <div key={index} className="border-b border-gray-200 dark:border-zinc-700 pb-6 last:border-0 last:pb-0">
//                             <div className="flex items-start justify-between mb-3">
//                               <div>
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <div className="flex">
//                                     {[...Array(5)].map((_, i) => (
//                                       <StarIconSolid
//                                         key={i}
//                                         className={`w-5 h-5 ${i < review.rating ? 'text-amber-500' : 'text-gray-300 dark:text-zinc-700'}`}
//                                       />
//                                     ))}
//                                   </div>
//                                   <span className="text-sm font-bold text-gray-900 dark:text-white">
//                                     {review.rating}/5
//                                   </span>
//                                 </div>
//                                 <p className="text-sm text-gray-600 dark:text-zinc-400">
//                                   by <span className="font-semibold">{review.homeownerName}</span> • {review.date}
//                                 </p>
//                               </div>
//                             </div>

//                             {review.jobTitle && (
//                               <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
//                                 {review.jobTitle}
//                               </p>
//                             )}

//                             <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                               "{review.comment}"
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Professional Stats Summary */}
//                   {selectedTradesperson.stats && (
//                     <div className="grid grid-cols-3 gap-3">
//                       <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
//                         <p className="text-3xl font-black text-blue-600">{selectedTradesperson.stats.totalJobs}</p>
//                         <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Total Jobs</p>
//                       </div>
//                       <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
//                         <p className="text-3xl font-black text-green-600">{selectedTradesperson.stats.completionRate}%</p>
//                         <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Completion Rate</p>
//                       </div>
//                       <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
//                         <p className="text-3xl font-black text-purple-600">{selectedTradesperson.stats.repeatClients || 0}</p>
//                         <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Repeat Clients</p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Action Buttons */}

//                   {/* <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
//                     <button
//                       onClick={() => {
//                         setShowProfileModal(false);
//                         setSelectedTradesperson(null);
//                       }}
//                       className="flex-1 px-6 py-4 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-lg"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowProfileModal(false);
//                         setSelectedTradesperson(null);
//                         // Find the corresponding lead
//                         const lead = leads.find(l =>
//                           (l.tradesperson_id === selectedTradesperson.userId) ||
//                           (l.tradesperson?.id === selectedTradesperson.userId)
//                         );
//                         if (lead) {
//                           setSelectedLead(lead);
//                           setShowHireModal(true);
//                         } else {
//                           toast.error('Cannot find quote for this professional');
//                         }
//                       }}
//                       className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
//                     >
//                       <CheckCircleIcon className="w-6 h-6" />
//                       Hire This Professional
//                     </button>
//                   </div> */}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Completion Modal */}
//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
//             <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
//               <h3 className="text-2xl font-black text-white">Mark as COMPLETED?</h3>
//             </div>
//             <div className="p-8">
//               <div className="space-y-4 mb-6">
//                 <div className="flex items-start gap-3">
//                   <CheckCircleSolid className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-gray-700 dark:text-zinc-300">Work is finished</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircleSolid className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-gray-700 dark:text-zinc-300">All payments are settled</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
//                 You'll be able to rate the tradesperson after completion.
//               </p>
//               <div className="flex gap-4">
//                 <button onClick={() => setShowCompleteModal(false)} className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
//                   Cancel
//                 </button>
//                 <button onClick={confirmCompletion} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30">
//                   OK
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Rate Prompt Modal */}
//       {showRatePromptModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
//             <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
//               <h3 className="text-2xl font-black text-white flex items-center gap-2">
//                 <StarIconSolid className="w-7 h-7" />
//                 Rate Your Experience
//               </h3>
//             </div>
//             <div className="p-8">
//               <p className="text-gray-700 dark:text-zinc-300 mb-6 text-center text-lg">
//                 Would you like to rate the tradesperson now?
//               </p>
//               <div className="flex gap-4">
//                 <button onClick={() => setShowRatePromptModal(false)} className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
//                   Cancel
//                 </button>
//                 <button onClick={handleNavigateToRating} className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
//                   <StarIconSolid className="w-5 h-5" />
//                   OK
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CSS Animations */}
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes progress {
//           from { width: 100%; }
//           to { width: 0%; }
//         }
//         @keyframes scaleIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fade-in { animation: fadeIn 0.3s ease-out; }
//         .animate-progress { animation: progress 5s linear forwards; }
//         .animate-scale-in { animation: scaleIn 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// }









"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  StarIcon,
  EyeIcon,
  BriefcaseIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import { toast, Toaster } from "react-hot-toast";

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId || params?.id;

  const [job, setJob] = useState(null);
  const [leads, setLeads] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiringInProgress, setHiringInProgress] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // New states for tradesperson profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedTradesperson, setSelectedTradesperson] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Existing modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRatePromptModal, setShowRatePromptModal] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    icon: null,
  });

  // Fetch logged-in user
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [router]);

  // Fetch job details
  const fetchJobDetails = useCallback(async () => {
    if (!jobId) {
      console.error("No jobId available");
      return;
    }

    try {
      const res = await fetch(`/api/homeowner/jobs/${jobId}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setJob(data.data || data);
      } else {
        console.error("Failed to fetch job details:", res.status);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    }
  }, [jobId]);

  // Fetch leads for this job
  const fetchLeads = useCallback(async () => {
    if (!jobId) {
      console.error("No jobId available");
      return;
    }

    try {
      const res = await fetch(`/api/homeowner/jobs/${jobId}/leads`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error("Failed to fetch leads:", res.status);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }, [jobId]);

  // Fetch tradesperson profile
  const fetchTradespersonProfile = async (tradespersonId) => {
    if (!tradespersonId) {
      toast.error("No tradesperson ID provided");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch(`/api/homeowner/tradesperson/${tradespersonId}`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Profile data received:", data); // Debug log
        if (data.success) {
          setSelectedTradesperson(data.data);
          setShowProfileModal(true);
        } else {
          toast.error(data.message || 'Failed to load profile');
        }
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      console.error("JobId is missing from params");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await fetchUser();
      await fetchJobDetails();
      await fetchLeads();
      setLoading(false);
    };
    loadData();
  }, [jobId, fetchUser, fetchJobDetails, fetchLeads]);

  // Show notification
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      icon: type === "success" ? CheckCircleSolid : ExclamationTriangleIcon,
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Handle hiring
  const handleHire = async (leadId) => {
    if (!jobId) {
      showNotification("error", "Error", "Job ID is missing.");
      return;
    }

    setHiringInProgress(true);
    try {
      const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("success", "Success!", "Tradesperson hired successfully!");
        await fetchJobDetails();
        await fetchLeads();
        setShowHireModal(false);
        setSelectedLead(null);
      } else {
        showNotification("error", "Failed to Hire", data.message || "Failed to hire tradesperson.");
      }
    } catch (error) {
      console.error("Error hiring tradesperson:", error);
      showNotification("error", "Something Went Wrong", "An error occurred.");
    } finally {
      setHiringInProgress(false);
    }
  };

  // Handle completion
  const handleMarkAsCompleted = async () => {
    if (!jobId || !user) {
      toast.error("Please login to update job status");
      return;
    }

    if (job.status !== 'HIRED') {
      toast.error("Only HIRED jobs can be marked as completed");
      return;
    }

    setShowCompleteModal(true);
  };

  const confirmCompletion = async () => {
    setShowCompleteModal(false);
    setUpdatingStatus(true);
    const loadingToast = toast.loading("Updating job status...");

    try {
      const userId = user?._id || user?.id || user?.user?._id;

      const res = await fetch(`/api/jobs/homeowner/${jobId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
          'x-user-role': 'HOMEOWNER'
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("✅ Job marked as completed!");
        await fetchJobDetails();

        setTimeout(() => {
          if (job.hired_tradesperson_name || job.hiredTradespersonName) {
            setShowRatePromptModal(true);
          }
        }, 1000);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Something went wrong');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleNavigateToRating = () => {
    setShowRatePromptModal(false);
    router.push(`/homeowner/jobs/${jobId}/rate`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      OPEN: "Open",
      HIRED: "Hired",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      OPEN: "text-green-600 bg-green-50 dark:bg-green-900/20",
      HIRED: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
      REJECTED: "text-red-600 bg-red-50 dark:bg-red-900/20",
      IN_PROGRESS: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
      COMPLETED: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    };
    return colorMap[status] || "text-gray-600 bg-gray-50";
  };

  const hasBeenRated = job?.has_rated === 1 || job?.has_rated === true || job?.hasRated === 1 || job?.hasRated === true;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-zinc-400">Job not found</p>
          <Link href="/homeowner" className="text-[#155DFC] hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Toaster position="top-right" />

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`rounded-2xl shadow-2xl overflow-hidden min-w-[380px] ${notification.type === "success"
            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
            : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800"
            }`}>
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === "success" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                  }`}>
                  {notification.type === "success" ? (
                    <CheckCircleSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-black ${notification.type === "success" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                    }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 ${notification.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                    {notification.message}
                  </p>
                </div>
                <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full ${notification.type === "success" ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"
                  } animate-progress`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/homeowner" className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Job Details</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">Manage quotes and hire professionals for your project</p>
        </div>

        {/* Action Banners */}
        {job.status === 'HIRED' && (
          <div className="mb-6 p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Job In Progress</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-0.5">Has the work been completed? Mark this job as completed when finished.</p>
                </div>
              </div>
              <button onClick={handleMarkAsCompleted} disabled={updatingStatus} className="w-full sm:w-auto px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20">
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {job.status === 'COMPLETED' && !hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
          <div className="mb-6 p-4 sm:p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <StarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-300">Rate Your Experience</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">How was your experience with {job.hired_tradesperson_name || job.hiredTradespersonName}? Your feedback helps others.</p>
                </div>
              </div>
              <button onClick={handleNavigateToRating} className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30">
                <StarIconSolid className="w-5 h-5" />
                Rate Tradesperson
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-6 sm:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-blue-100 uppercase tracking-widest mb-1 sm:mb-2 text-center sm:text-left">
                      {job.category_name || job.category?.name || "Job"}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center sm:text-left">
                      {job.subcategory_name || job.subCategory?.name || "Details"}
                    </h2>
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider ${getStatusColor(job.status)}`}>
                      {formatStatus(job.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
                    <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{job.description || "No description provided"}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Location</p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">{job.city || job.location?.city || "N/A"}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500">{job.postcode || job.location?.postcode || ""}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Budget Range</p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          ${(job.budget_min || job.budgetMin || 0).toLocaleString()} - ${(job.budget_max || job.budgetMax || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Posted</p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">{formatDate(job.created_at || job.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                        <UserCircleIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Quotes Received</p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">{leads.length} Professional{leads.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-4 text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-lg font-black mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">Our team is here to assist you with your project</p>
              <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">Contact Support</button>
            </div>

            {job.status === "HIRED" && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Hired Professional</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-zinc-300 font-semibold">{job.hired_tradesperson_name || job.hiredTradespersonName || "Professional"}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">Hired on {formatDate(job.hired_at || job.hiredAt)}</p>
                </div>
              </div>
            )}

            {job.status === "COMPLETED" && !hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
              <div className="rounded-3xl border p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-4">
                  <StarIcon className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">Pending Rating</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400">Please rate your experience to help others</p>
                  <button onClick={handleNavigateToRating} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                    <StarIconSolid className="w-4 h-4" />
                    Rate Now
                  </button>
                </div>
              </div>
            )}

            {job.status === "COMPLETED" && hasBeenRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
              <div className="rounded-3xl border p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                  <StarIconSolid className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-black text-green-900 dark:text-green-300">Rating Submitted</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-green-600 dark:text-green-400">Thank you for rating this tradesperson!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leads Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Quotes Received ({leads.length})</h2>
              <p className="text-gray-600 dark:text-zinc-400 mt-1">Review and compare quotes from professionals</p>
            </div>

            <div className="p-4 sm:p-8">
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
                  <p className="text-gray-600 dark:text-zinc-400 font-bold">No quotes received yet</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">Professionals will send you quotes soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {leads.map((lead) => (
                    <div key={lead.id || lead._id} className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Professional Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg flex-shrink-0">
                                {(lead.tradesperson_name || lead.company_name || "P")[0]?.toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                  {lead.tradesperson_name || lead.company_name || "Professional"}
                                </h3>
                                {lead.company_name && lead.tradesperson_name && (
                                  <p className="text-sm text-gray-600 dark:text-zinc-400">{lead.company_name}</p>
                                )}
                                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(lead.status)}`}>
                                  {formatStatus(lead.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {lead.phone && (
                              <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                <a href={`tel:${lead.phone}`} className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]">
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                <a href={`mailto:${lead.email}`} className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                          </div>

                          {lead.message && (
                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
                              <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Quote Message</p>
                              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{lead.message}</p>
                            </div>
                          )}

                          {lead.price_estimate && (
                            <div className="mb-4">
                              <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Price Estimate</p>
                              <p className="text-2xl font-black text-[#155DFC]">${lead.price_estimate}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-zinc-500">
                            <div>
                              <span className="font-bold uppercase tracking-widest">Submitted:</span> {formatDate(lead.created_at || lead.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 items-center justify-center w-full lg:w-auto">
                          {job.status === "OPEN" && lead.status !== "HIRED" && (
                            <>
                              <button
                                onClick={() => {
                                  // Get tradesperson ID from lead
                                  const tradespersonId = lead.tradesperson_id || lead.tradesperson?.id || lead.tradesperson?._id;
                                  if (tradespersonId) {
                                    fetchTradespersonProfile(tradespersonId);
                                  } else {
                                    toast.error("Unable to view profile - missing tradesperson ID");
                                  }
                                }}
                                disabled={profileLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 flex items-center gap-2 w-full justify-center"
                              >
                                <EyeIcon className="w-4 h-4" />
                                {profileLoading ? "Loading..." : "View Profile"}
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowHireModal(true);
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 flex items-center gap-2 w-full justify-center"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                Hire Now
                              </button>
                            </>
                          )}
                          {lead.status === "HIRED" && (
                            <div className="flex items-center gap-2 text-green-600 font-bold">
                              <CheckCircleIcon className="w-6 h-6" />
                              <span>Hired</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hire Confirmation Modal */}
      {showHireModal && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-black text-white">Confirm Hire</h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 dark:text-zinc-300 mb-6 leading-relaxed">
                Are you sure you want to hire{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedLead.tradesperson_name || selectedLead.company_name || "this professional"}
                </span>{" "}
                for this job? This action will mark all other quotes as rejected.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setShowHireModal(false); setSelectedLead(null); }}
                  disabled={hiringInProgress}
                  className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleHire(selectedLead.id || selectedLead._id)}
                  disabled={hiringInProgress}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hiringInProgress ? "Hiring..." : "Confirm Hire"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tradesperson Profile Modal - ENHANCED VERSION */}
      {showProfileModal && selectedTradesperson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide">
            <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Professional Profile</h3>
                <button onClick={() => { setShowProfileModal(false); setSelectedTradesperson(null); }} className="text-white hover:text-blue-200">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC]"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
                    {/* Profile Image with Full Screen Click */}
                    <div
                      className="h-24 w-24 rounded-2xl bg-gray-200 dark:bg-zinc-800 overflow-hidden cursor-pointer shadow-lg flex-shrink-0 relative group"
                      onClick={() => setShowFullImage(true)}
                    >
                      {selectedTradesperson.profileImage && selectedTradesperson.profileImage !== '/default-avatar.png' ? (
                        <>
                          <img
                            src={selectedTradesperson.profileImage}
                            alt={selectedTradesperson.companyName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <EyeIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center text-white font-black text-3xl">
                          {selectedTradesperson.name?.[0]?.toUpperCase() || selectedTradesperson.companyName?.[0]?.toUpperCase() || 'P'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                        {selectedTradesperson.companyName || 'Professional'}
                      </h4>
                      <p className="text-gray-600 dark:text-zinc-400 mt-1 text-base sm:text-lg">{selectedTradesperson.name}</p>

                      {/* Rating and Stats */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
                          <StarIconSolid className="w-6 h-6 text-amber-500" />
                          <span className="font-black text-xl text-gray-900 dark:text-white">
                            {selectedTradesperson.averageRating}
                          </span>
                          <span className="text-gray-500 dark:text-zinc-500 text-sm">
                            ({selectedTradesperson.totalRatings} {selectedTradesperson.totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                          <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            {selectedTradesperson.completedJobs} jobs completed
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
                          <CalendarIcon className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            Member since {selectedTradesperson.memberSince}
                          </span>
                        </div>

                        {selectedTradesperson.verified && (
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-700 dark:text-green-400">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Additional Stats */}
                      {selectedTradesperson.responseTime && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-gray-600 dark:text-zinc-400">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm">Typically responds {selectedTradesperson.responseTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTradesperson.email && selectedTradesperson.email !== 'N/A' && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Email</p>
                          <a href={`mailto:${selectedTradesperson.email}`} className="text-gray-900 dark:text-white font-medium hover:text-[#155DFC]">
                            {selectedTradesperson.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedTradesperson.phone && selectedTradesperson.phone !== 'Not provided' && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Phone</p>
                          <a href={`tel:${selectedTradesperson.phone}`} className="text-gray-900 dark:text-white font-medium hover:text-[#155DFC]">
                            {selectedTradesperson.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedTradesperson.postcode && selectedTradesperson.postcode !== 'Not specified' && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Location</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {selectedTradesperson.postcode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills & Services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                      <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                        Skills & Expertise
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedTradesperson.skills && selectedTradesperson.skills.length > 0 && selectedTradesperson.skills[0] !== '' ? (
                          selectedTradesperson.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-zinc-500 italic">General services</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                      <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-green-600" />
                        Service Areas
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedTradesperson.serviceAreas && selectedTradesperson.serviceAreas.length > 0 && selectedTradesperson.serviceAreas[0] !== '' ? (
                          selectedTradesperson.serviceAreas.map((area, index) => (
                            <span key={index} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                              {area}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-zinc-500 italic">Various locations</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedTradesperson.bio && selectedTradesperson.bio !== 'No bio provided' && (
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-gray-200 dark:border-zinc-700">
                      <h5 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5 text-gray-600" />
                        About
                      </h5>
                      <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                        {selectedTradesperson.bio}
                      </p>
                    </div>
                  )}

                  {/* Rating Distribution */}

                  {selectedTradesperson.ratingDistribution && selectedTradesperson.totalRatings > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                      <h5 className="font-black text-gray-900 dark:text-white mb-4">Rating Breakdown</h5>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = selectedTradesperson.ratingDistribution?.[stars] || 0;
                          const percentage = selectedTradesperson.totalRatings > 0
                            ? (count / selectedTradesperson.totalRatings) * 100
                            : 0;
                          return (
                            <div key={stars} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-20">
                                <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{stars}</span>
                                <StarIconSolid className="w-4 h-4 text-amber-500" />
                              </div>
                              <div className="flex-1 h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400 w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {selectedTradesperson.reviews && selectedTradesperson.reviews.length > 0 && (
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-gray-200 dark:border-zinc-700">
                      <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <StarIconSolid className="w-5 h-5 text-amber-500" />
                        Recent Reviews ({selectedTradesperson.reviews.length})
                      </h5>
                      <div className="space-y-6">
                        {selectedTradesperson.reviews.map((review, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-zinc-700 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIconSolid
                                        key={i}
                                        className={`w-5 h-5 ${i < review.rating ? 'text-amber-500' : 'text-gray-300 dark:text-zinc-700'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {review.rating}/5
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">
                                  by <span className="font-semibold">{review.homeownerName}</span> • {review.date}
                                </p>
                              </div>
                            </div>

                            {review.jobTitle && (
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                                {review.jobTitle}
                              </p>
                            )}

                            <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Stats Summary */}
                  {selectedTradesperson.stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <p className="text-2xl sm:text-3xl font-black text-blue-600">{selectedTradesperson.stats.totalJobs}</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Total Jobs</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                        <p className="text-2xl sm:text-3xl font-black text-green-600">{selectedTradesperson.stats.completionRate}%</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Completion Rate</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                        <p className="text-2xl sm:text-3xl font-black text-purple-600">{selectedTradesperson.stats.repeatClients || 0}</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-400 mt-1">Repeat Clients</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}

                  {/* <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setSelectedTradesperson(null);
                      }}
                      className="flex-1 px-6 py-4 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-lg"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setSelectedTradesperson(null);
                        // Find the corresponding lead
                        const lead = leads.find(l =>
                          (l.tradesperson_id === selectedTradesperson.userId) ||
                          (l.tradesperson?.id === selectedTradesperson.userId)
                        );
                        if (lead) {
                          setSelectedLead(lead);
                          setShowHireModal(true);
                        } else {
                          toast.error('Cannot find quote for this professional');
                        }
                      }}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                      Hire This Professional
                    </button>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
              <h3 className="text-2xl font-black text-white">Mark as COMPLETED?</h3>
            </div>
            <div className="p-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircleSolid className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-zinc-300">Work is finished</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleSolid className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-zinc-300">All payments are settled</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                You'll be able to rate the tradesperson after completion.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowCompleteModal(false)} className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                  Cancel
                </button>
                <button onClick={confirmCompletion} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Prompt Modal */}
      {showRatePromptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <StarIconSolid className="w-7 h-7" />
                Rate Your Experience
              </h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 dark:text-zinc-300 mb-6 text-center text-lg">
                Would you like to rate the tradesperson now?
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowRatePromptModal(false)} className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                  Cancel
                </button>
                <button onClick={handleNavigateToRating} className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
                  <StarIconSolid className="w-5 h-5" />
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showFullImage && selectedTradesperson?.profileImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowFullImage(false); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2 z-[70]"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <img
            src={selectedTradesperson.profileImage}
            alt="Profile Full Screen"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-progress { animation: progress 5s linear forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}






