// // "use client";

// // import { useState, useEffect, useCallback } from "react";
// // import { useRouter, useParams } from "next/navigation";
// // import { toast } from "react-hot-toast";
// // import {
// //     ArrowLeftIcon,
// //     MapPinIcon,
// //     CalendarIcon,
// //     BanknotesIcon,
// //     UserIcon,
// //     PhoneIcon,
// //     EnvelopeIcon,
// //     BuildingOfficeIcon,
// //     ClockIcon,
// //     CheckCircleIcon,
// //     XCircleIcon,
// //     ChatBubbleLeftRightIcon,
// // } from "@heroicons/react/24/outline";
// // import { StarIcon } from "@heroicons/react/24/solid";

// // export default function JobDetailsPage() {
// //     const router = useRouter();
// //     const params = useParams(); // ✅ useParams का use करें
// //     const [jobData, setJobData] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [activeTab, setActiveTab] = useState("details");
// //     const [user, setUser] = useState(null);
// //     const [jobId, setJobId] = useState(null);

// //     // ✅ जैसे job form में user fetch किया था, वैसे ही यहाँ करें
// //     const fetchUser = useCallback(async () => {
// //         try {
// //             const res = await fetch("/api/me", {
// //                 credentials: "include",
// //                 cache: "no-store",
// //             });
            
// //             if (res.ok) {
// //                 const userData = await res.json();
// //                 setUser(userData);
// //             } else {
// //                 setUser(null);
// //             }
// //         } catch (error) {
// //             console.error("Error fetching user:", error);
// //             setUser(null);
// //         }
// //     }, []);

// //     // ✅ सबसे पहले user fetch करें और params से jobId निकालें
// //     useEffect(() => {
// //         fetchUser();
        
// //         if (!params) return;
        
// //         // App Router में dynamic route parameter को सही तरीके से access करें
// //         // Check all possible param names
// //         const id = params.jobId || params.id || params.slug;
        
// //         // Debug log
// //         console.log("All params:", params);
// //         console.log("Extracted jobId:", id);
        
// //         if (!id || id === "undefined") {
// //             console.error("Invalid job ID from params:", id);
// //             toast.error("Invalid job link");
// //             router.push("/homeowner/my-jobs");
// //             return;
// //         }
        
// //         setJobId(id);
// //     }, [params, router, fetchUser]);

// //     // ✅ जब jobId मिल जाए, तब fetch करें
// //     useEffect(() => {
// //         if (!jobId) return;
        
// //         fetchJobDetails();
// //     }, [jobId]);

// //     const fetchJobDetails = async () => {
// //         try {
// //             setLoading(true);
// //             console.log("Fetching job details for ID:", jobId);
            
// //             const res = await fetch(`/api/homeowner/my-jobs/${jobId}`, {
// //                 credentials: "include",
// //             });

// //             if (!res.ok) {
// //                 const errorData = await res.json();
// //                 throw new Error(errorData.message || "Failed to fetch job details");
// //             }

// //             const data = await res.json();
            
// //             if (!data.success) {
// //                 throw new Error(data.message || "Failed to fetch job details");
// //             }

// //             setJobData(data.data);
// //         } catch (error) {
// //             console.error("Error fetching job details:", error);
// //             toast.error(error.message || "Failed to load job details");
// //             router.push("/homeowner/my-jobs");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     // ✅ अगर params से jobId नहीं मिल रहा तो एक alternative solution
// //     // यह check करें कि URL से jobId extract करें
// //     useEffect(() => {
// //         if (params && Object.keys(params).length === 0) {
// //             // Try to get from URL
// //             const pathParts = window.location.pathname.split('/');
// //             const possibleId = pathParts[pathParts.length - 1];
            
// //             if (possibleId && possibleId !== "undefined" && possibleId !== "my-jobs") {
// //                 console.log("Extracted jobId from URL:", possibleId);
// //                 setJobId(possibleId);
// //             }
// //         }
// //     }, [params]);

// //     const formatDate = (dateString) => {
// //         return new Date(dateString).toLocaleDateString("en-US", {
// //             year: "numeric",
// //             month: "long",
// //             day: "numeric",
// //         });
// //     };

// //     const formatTime = (dateString) => {
// //         return new Date(dateString).toLocaleTimeString("en-US", {
// //             hour: "2-digit",
// //             minute: "2-digit",
// //         });
// //     };

// //     const getStatusBadge = (status) => {
// //         const statusConfig = {
// //             OPEN: { color: "bg-green-100 text-green-800 border-green-200", label: "Open" },
// //             IN_PROGRESS: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
// //             COMPLETED: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Completed" },
// //             CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
// //         };

// //         const config = statusConfig[status] || statusConfig.OPEN;
// //         return (
// //             <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
// //                 {config.label}
// //             </span>
// //         );
// //     };

// //     const getStartTimeLabel = (startTime) => {
// //         const labels = {
// //             URGENT: "Urgent",
// //             WITHIN_2_DAYS: "Within 2 Days",
// //             WITHIN_2_WEEKS: "Within 2 Weeks",
// //             WITHIN_2_MONTHS: "Within 2 Months",
// //             FLEXIBLE: "Flexible",
// //         };
// //         return labels[startTime] || startTime;
// //     };

// //     const getJobStageLabel = (stage) => {
// //         const labels = {
// //             READY_TO_HIRE: "Ready to Hire",
// //             PLANNING: "Planning",
// //             INSURANCE_WORK: "Insurance Work",
// //         };
// //         return labels[stage] || stage;
// //     };

// //     // ✅ Initial loading state - check for jobId
// //     if (!jobId && !loading) {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //                 <div className="text-center">
// //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mx-auto mb-4"></div>
// //                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Job Details...</h2>
// //                     <p className="text-gray-600 mb-6">Please wait while we fetch the job information</p>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     if (loading) {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //                 <div className="flex flex-col items-center gap-4">
// //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
// //                     <p className="text-gray-600 font-medium">Loading job details...</p>
// //                     <p className="text-sm text-gray-500">Job ID: {jobId}</p>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     if (!jobData) {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //                 <div className="text-center">
// //                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
// //                     <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or you don't have permission to view it.</p>
// //                     <button
// //                         onClick={() => router.push("/homeowner/my-jobs")}
// //                         className="bg-[#1149C7] text-white px-6 py-2 rounded-lg hover:bg-[#0d38a0] transition"
// //                     >
// //                         Back to My Jobs
// //                     </button>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     const { job, leads, summary } = jobData;

// //     return (
// //         <div className="min-h-screen bg-gray-50 py-8">
// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //                 {/* Header */}
// //                 <div className="mb-8">
// //                     <button
// //                         onClick={() => router.push("/homeowner/my-jobs")}
// //                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
// //                     >
// //                         <ArrowLeftIcon className="w-5 h-5" />
// //                         <span className="font-medium">Back to My Jobs</span>
// //                     </button>

// //                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// //                         <div>
// //                             <h1 className="text-3xl font-bold text-gray-900 mb-2">
// //                                 {job.category?.name || "Job Details"}
// //                             </h1>
// //                             <p className="text-gray-600">
// //                                 {job.subCategory?.name} • Posted {formatDate(job.createdAt)}
// //                             </p>
// //                         </div>
// //                         <div className="flex items-center gap-3">
// //                             {getStatusBadge(job.status)}
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Tabs */}
// //                 <div className="border-b border-gray-200 mb-6">
// //                     <div className="flex gap-8">
// //                         <button
// //                             onClick={() => setActiveTab("details")}
// //                             className={`pb-3 border-b-2 font-semibold transition ${
// //                                 activeTab === "details"
// //                                     ? "border-[#1149C7] text-[#1149C7]"
// //                                     : "border-transparent text-gray-500 hover:text-gray-700"
// //                             }`}
// //                         >
// //                             Job Details
// //                         </button>
// //                         <button
// //                             onClick={() => setActiveTab("leads")}
// //                             className={`pb-3 border-b-2 font-semibold transition flex items-center gap-2 ${
// //                                 activeTab === "leads"
// //                                     ? "border-[#1149C7] text-[#1149C7]"
// //                                     : "border-transparent text-gray-500 hover:text-gray-700"
// //                             }`}
// //                         >
// //                             Received Leads
// //                             {summary.totalLeads > 0 && (
// //                                 <span className="bg-[#1149C7] text-white text-xs px-2 py-0.5 rounded-full">
// //                                     {summary.totalLeads}
// //                                 </span>
// //                             )}
// //                         </button>
// //                     </div>
// //                 </div>

// //                 {/* Content */}
// //                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //                     {/* Main Content */}
// //                     <div className="lg:col-span-2">
// //                         {activeTab === "details" && (
// //                             <div className="space-y-6">
// //                                 {/* Job Description */}
// //                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                     <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
// //                                     <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
// //                                         {job.description}
// //                                     </p>
// //                                 </div>

// //                                 {/* Budget */}
// //                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                     <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
// //                                         <BanknotesIcon className="w-6 h-6 text-[#1149C7]" />
// //                                         Budget
// //                                     </h2>
// //                                     <div className="flex items-center gap-4">
// //                                         <div className="flex-1">
// //                                             <p className="text-sm text-gray-500 mb-1">Minimum</p>
// //                                             <p className="text-2xl font-bold text-gray-900">
// //                                                 £{job.budgetMin?.toLocaleString() || 0}
// //                                             </p>
// //                                         </div>
// //                                         <div className="text-gray-400">—</div>
// //                                         <div className="flex-1">
// //                                             <p className="text-sm text-gray-500 mb-1">Maximum</p>
// //                                             <p className="text-2xl font-bold text-gray-900">
// //                                                 £{job.budgetMax?.toLocaleString() || 0}
// //                                             </p>
// //                                         </div>
// //                                     </div>
// //                                 </div>

// //                                 {/* Timeline & Stage */}
// //                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                         <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
// //                                             <ClockIcon className="w-5 h-5 text-[#1149C7]" />
// //                                             Start Time
// //                                         </h3>
// //                                         <p className="text-gray-700 font-medium">
// //                                             {getStartTimeLabel(job.startTime)}
// //                                         </p>
// //                                     </div>
// //                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                         <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
// //                                             <CheckCircleIcon className="w-5 h-5 text-[#1149C7]" />
// //                                             Project Stage
// //                                         </h3>
// //                                         <p className="text-gray-700 font-medium">
// //                                             {getJobStageLabel(job.jobStage)}
// //                                         </p>
// //                                     </div>
// //                                 </div>

// //                                 {/* Media */}
// //                                 {job.media && job.media.length > 0 && (
// //                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                         <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
// //                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// //                                             {job.media.map((item, index) => (
// //                                                 <div key={index} className="relative group">
// //                                                     {item.type === "IMAGE" ? (
// //                                                         <img
// //                                                             src={item.url}
// //                                                             alt={`Job media ${index + 1}`}
// //                                                             className="w-full h-40 object-cover rounded-lg border border-gray-200"
// //                                                         />
// //                                                     ) : (
// //                                                         <video
// //                                                             src={item.url}
// //                                                             controls
// //                                                             className="w-full h-40 object-cover rounded-lg border border-gray-200"
// //                                                         />
// //                                                     )}
// //                                                 </div>
// //                                             ))}
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         )}

// //                         {activeTab === "leads" && (
// //                             <div className="space-y-4">
// //                                 {leads && leads.length > 0 ? (
// //                                     leads.map((lead) => (
// //                                         <div
// //                                             key={lead._id}
// //                                             className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
// //                                         >
// //                                             {/* Tradesperson Header */}
// //                                             <div className="flex items-start gap-4 mb-4">
// //                                                 <div className="w-12 h-12 rounded-full bg-[#1149C7] flex items-center justify-center text-white font-bold text-lg">
// //                                                     {lead.tradesperson?.user?.name?.charAt(0).toUpperCase() || "T"}
// //                                                 </div>
// //                                                 <div className="flex-1">
// //                                                     <h3 className="font-bold text-lg text-gray-900">
// //                                                         {lead.tradesperson?.user?.name || "Anonymous Tradesperson"}
// //                                                     </h3>
// //                                                     <p className="text-gray-600 flex items-center gap-1">
// //                                                         <BuildingOfficeIcon className="w-4 h-4" />
// //                                                         {lead.tradesperson?.companyName || "No company info"}
// //                                                     </p>
// //                                                 </div>
// //                                                 <div className="text-right">
// //                                                     <p className="text-sm text-gray-500">Received</p>
// //                                                     <p className="text-sm font-semibold text-gray-900">
// //                                                         {formatDate(lead.createdAt)}
// //                                                     </p>
// //                                                     <p className="text-xs text-gray-500">
// //                                                         {formatTime(lead.createdAt)}
// //                                                     </p>
// //                                                 </div>
// //                                             </div>

// //                                             {/* Message */}
// //                                             <div className="mb-4 bg-gray-50 rounded-lg p-4">
// //                                                 <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
// //                                                     <ChatBubbleLeftRightIcon className="w-4 h-4" />
// //                                                     Message
// //                                                 </p>
// //                                                 <p className="text-gray-700 whitespace-pre-wrap">
// //                                                     {lead.message || "No message provided"}
// //                                                 </p>
// //                                             </div>

// //                                             {/* Price Estimate */}
// //                                             {lead.priceEstimate && (
// //                                                 <div className="mb-4">
// //                                                     <p className="text-sm font-semibold text-gray-700 mb-1">
// //                                                         Price Estimate
// //                                                     </p>
// //                                                     <p className="text-2xl font-bold text-[#1149C7]">
// //                                                         £{lead.priceEstimate.toLocaleString()}
// //                                                     </p>
// //                                                 </div>
// //                                             )}

// //                                             {/* Contact Info (if unlocked) */}
// //                                             {lead.isUnlocked && (
// //                                                 <div className="border-t border-gray-200 pt-4 mt-4">
// //                                                     <p className="text-sm font-semibold text-gray-700 mb-3">
// //                                                         Contact Information
// //                                                     </p>
// //                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                                                         <div className="flex items-center gap-2 text-gray-700">
// //                                                             <EnvelopeIcon className="w-5 h-5 text-gray-400" />
// //                                                             <a
// //                                                                 href={`mailto:${lead.tradesperson?.user?.email}`}
// //                                                                 className="hover:text-[#1149C7] transition"
// //                                                             >
// //                                                                 {lead.tradesperson?.user?.email}
// //                                                             </a>
// //                                                         </div>
// //                                                         {lead.tradesperson?.user?.phone && (
// //                                                             <div className="flex items-center gap-2 text-gray-700">
// //                                                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
// //                                                                 <a
// //                                                                     href={`tel:${lead.tradesperson?.user?.phone}`}
// //                                                                     className="hover:text-[#1149C7] transition"
// //                                                                 >
// //                                                                     {lead.tradesperson?.user?.phone}
// //                                                                 </a>
// //                                                             </div>
// //                                                         )}
// //                                                     </div>
// //                                                 </div>
// //                                             )}

// //                                             {/* Unlocked Badge */}
// //                                             {lead.isUnlocked && (
// //                                                 <div className="mt-4">
// //                                                     <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
// //                                                         <CheckCircleIcon className="w-4 h-4" />
// //                                                         Contact Details Unlocked
// //                                                     </span>
// //                                                 </div>
// //                                             )}
// //                                         </div>
// //                                     ))
// //                                 ) : (
// //                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
// //                                         <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //                                         <h3 className="text-xl font-bold text-gray-900 mb-2">
// //                                             No Leads Yet
// //                                         </h3>
// //                                         <p className="text-gray-600">
// //                                             Tradespeople will send you quotes for this job soon.
// //                                         </p>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         )}
// //                     </div>

// //                     {/* Sidebar */}
// //                     <div className="lg:col-span-1">
// //                         <div className="space-y-6 sticky top-6">
// //                             {/* Location */}
// //                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
// //                                     <MapPinIcon className="w-5 h-5 text-[#1149C7]" />
// //                                     Location
// //                                 </h3>
// //                                 <p className="text-gray-700 font-medium mb-1">
// //                                     {job.location?.postcode || "N/A"}
// //                                 </p>
// //                                 {job.location?.city && (
// //                                     <p className="text-gray-600 text-sm">{job.location.city}</p>
// //                                 )}
// //                             </div>

// //                             {/* Contact Info */}
// //                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
// //                                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
// //                                     <UserIcon className="w-5 h-5 text-[#1149C7]" />
// //                                     Your Contact Info
// //                                 </h3>
// //                                 <div className="space-y-3">
// //                                     <div>
// //                                         <p className="text-xs text-gray-500 mb-1">Name</p>
// //                                         <p className="text-gray-900 font-medium">{job.contactName}</p>
// //                                     </div>
// //                                     <div>
// //                                         <p className="text-xs text-gray-500 mb-1">Phone</p>
// //                                         <p className="text-gray-900 font-medium">{job.contactPhone}</p>
// //                                     </div>
// //                                     <div>
// //                                         <p className="text-xs text-gray-500 mb-1">Email</p>
// //                                         <p className="text-gray-900 font-medium break-all">
// //                                             {job.contactEmail}
// //                                         </p>
// //                                     </div>
// //                                 </div>
// //                             </div>

// //                             {/* Quick Stats */}
// //                             <div className="bg-gradient-to-br from-[#1149C7] to-[#0d38a0] rounded-lg shadow-sm p-6 text-white">
// //                                 <h3 className="font-semibold mb-4">Lead Summary</h3>
// //                                 <div className="space-y-3">
// //                                     <div className="flex justify-between items-center">
// //                                         <span className="text-white/80">Total Leads</span>
// //                                         <span className="text-2xl font-bold">{summary.totalLeads}</span>
// //                                     </div>
// //                                     <div className="flex justify-between items-center">
// //                                         <span className="text-white/80">Status</span>
// //                                         <span className="font-semibold capitalize">{job.status}</span>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }
































// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CurrencyRupeeIcon,
//   UserCircleIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CheckCircleIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/outline";

// export default function JobDetailsPage() {
//   const router = useRouter();
//   const params = useParams(); // ✅ FIX: Use useParams hook for client component
//   const jobId = params?.jobId || params?.id; // ✅ Get jobId from params
  
//   const [job, setJob] = useState(null);
//   const [leads, setLeads] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [hiringInProgress, setHiringInProgress] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showHireModal, setShowHireModal] = useState(false);

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
//         router.push("/login");
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

//   // Handle hiring a tradesperson
//   const handleHire = async (leadId) => {
//     if (!jobId) {
//       alert("Job ID is missing");
//       return;
//     }

//     setHiringInProgress(true);
//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ leadId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         // Success - refresh data
//         await fetchJobDetails();
//         await fetchLeads();
//         setShowHireModal(false);
//         setSelectedLead(null);
//       } else {
//         alert(data.message || "Failed to hire tradesperson");
//       }
//     } catch (error) {
//       console.error("Error hiring tradesperson:", error);
//       alert("Something went wrong. Please try again.");
//     } finally {
//       setHiringInProgress(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-IN", {
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

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
//           <Link href="/homeowner" className="text-blue-600 hover:underline mt-4 inline-block">
//             Back to Dashboard
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/homeowner"
//             className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
//           >
//             <ArrowLeftIcon className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
//             Job Details
//           </h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">
//             Manage quotes and hire professionals for your project
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Job Information Card */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">
//                       {job.category?.name}
//                     </p>
//                     <h2 className="text-3xl font-black text-white tracking-tight">
//                       {job.subCategory?.name}
//                     </h2>
//                   </div>
//                   <span
//                     className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(
//                       job.status
//                     )}`}
//                   >
//                     {formatStatus(job.status)}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">
//                       Description
//                     </h3>
//                     <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                       {job.description || "No description provided"}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                         <MapPinIcon className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Location
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {job.location?.city}, {job.location?.state}
//                         </p>
//                         <p className="text-sm text-gray-500 dark:text-zinc-500">
//                           {job.location?.pincode}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
//                         <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Budget Range
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           ₹{job.budgetMin?.toLocaleString()} - ₹
//                           {job.budgetMax?.toLocaleString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
//                         <CalendarIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Posted
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {formatDate(job.createdAt)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
//                         <UserCircleIcon className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Quotes Received
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {leads.length} Professional{leads.length !== 1 ? "s" : ""}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Content */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
//               <h3 className="text-lg font-black mb-2">Need Help?</h3>
//               <p className="text-sm text-blue-100 mb-4 leading-relaxed">
//                 Our team is here to assist you with your project
//               </p>
//               <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all">
//                 Contact Support
//               </button>
//             </div>

//             {job.status === "HIRED" && job.hiredTradesperson && (
//               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
//                 <div className="flex items-center gap-2 mb-4">
//                   <CheckCircleIcon className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-gray-900 dark:text-white">
//                     Hired Professional
//                   </h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-gray-700 dark:text-zinc-300 font-semibold">
//                     {job.hiredTradesperson.companyName || "Professional"}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500">
//                     Hired on {formatDate(job.hiredAt)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Leads/Quotes Section */}
//         <div className="mt-8">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//             <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">
//                 Quotes Received ({leads.length})
//               </h2>
//               <p className="text-gray-600 dark:text-zinc-400 mt-1">
//                 Review and compare quotes from professionals
//               </p>
//             </div>

//             <div className="p-8">
//               {leads.length === 0 ? (
//                 <div className="text-center py-12">
//                   <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
//                   <p className="text-gray-600 dark:text-zinc-400 font-bold">
//                     No quotes received yet
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
//                     Professionals will send you quotes soon
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                   {leads.map((lead) => (
//                     <div
//                       key={lead._id}
//                       className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
//                     >
//                       <div className="flex flex-col lg:flex-row gap-6">
//                         {/* Professional Info */}
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between mb-4">
//                             <div className="flex items-center gap-4">
//                               <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
//                                 {lead.tradesperson?.companyName?.[0]?.toUpperCase() || "P"}
//                               </div>
//                               <div>
//                                 <h3 className="text-xl font-black text-gray-900 dark:text-white">
//                                   {lead.tradesperson?.companyName || "Professional"}
//                                 </h3>
//                                 <span
//                                   className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(
//                                     lead.status
//                                   )}`}
//                                 >
//                                   {formatStatus(lead.status)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             {lead.tradesperson?.phone && (
//                               <div className="flex items-center gap-3">
//                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                 <span className="text-sm text-gray-700 dark:text-zinc-300">
//                                   {lead.tradesperson.phone}
//                                 </span>
//                               </div>
//                             )}
//                             {lead.tradesperson?.user?.email && (
//                               <div className="flex items-center gap-3">
//                                 <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                 <span className="text-sm text-gray-700 dark:text-zinc-300">
//                                   {lead.tradesperson.user.email}
//                                 </span>
//                               </div>
//                             )}
//                           </div>

//                           {lead.message && (
//                             <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
//                                 Quote Message
//                               </p>
//                               <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                                 {lead.message}
//                               </p>
//                             </div>
//                           )}

//                           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
//                             <div>
//                               <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
//                               {formatDate(lead.createdAt)}
//                             </div>
//                             {lead.tradesperson?.credits !== undefined && (
//                               <div>
//                                 <span className="font-bold uppercase tracking-widest">Credits:</span>{" "}
//                                 {lead.tradesperson.credits}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Action Button */}
//                         <div className="flex items-center">
//                           {job.status === "OPEN" && lead.status !== "HIRED" && (
//                             <button
//                               onClick={() => {
//                                 setSelectedLead(lead);
//                                 setShowHireModal(true);
//                               }}
//                               className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
//                             >
//                               Hire Now
//                             </button>
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
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
//               <h3 className="text-2xl font-black text-white">Confirm Hire</h3>
//             </div>
//             <div className="p-8">
//               <p className="text-gray-700 dark:text-zinc-300 mb-6 leading-relaxed">
//                 Are you sure you want to hire{" "}
//                 <span className="font-bold text-gray-900 dark:text-white">
//                   {selectedLead.tradesperson?.companyName}
//                 </span>{" "}
//                 for this job? This action will mark all other quotes as rejected.
//               </p>
//               <div className="flex gap-4">
//                 <button
//                   onClick={() => {
//                     setShowHireModal(false);
//                     setSelectedLead(null);
//                   }}
//                   disabled={hiringInProgress}
//                   className="flex-1 px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleHire(selectedLead._id)}
//                   disabled={hiringInProgress}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {hiringInProgress ? "Hiring..." : "Confirm Hire"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


























// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CurrencyPoundIcon,
//   UserCircleIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CheckCircleIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/outline";

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
//         console.log("Job data:", data);
//         setJob(data.data || data);
//       } else {
//         console.error("Failed to fetch job details:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
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
//         console.log("Leads data:", data);
//         setLeads(Array.isArray(data) ? data : data.data || []);
//       } else {
//         console.error("Failed to fetch leads:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
//       }
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     }
//   }, [jobId]);

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

//   // Handle hiring a tradesperson
//   const handleHire = async (leadId) => {
//     if (!jobId) {
//       alert("Job ID is missing");
//       return;
//     }

//     setHiringInProgress(true);
//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ leadId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         alert("Tradesperson hired successfully!");
//         await fetchJobDetails();
//         await fetchLeads();
//         setShowHireModal(false);
//         setSelectedLead(null);
//       } else {
//         alert(data.message || "Failed to hire tradesperson");
//       }
//     } catch (error) {
//       console.error("Error hiring tradesperson:", error);
//       alert("Something went wrong. Please try again.");
//     } finally {
//       setHiringInProgress(false);
//     }
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
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/homeowner"
//             className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4"
//           >
//             <ArrowLeftIcon className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
//             Job Details
//           </h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">
//             Manage quotes and hire professionals for your project
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Job Information Card */}
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
//                   <span
//                     className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(
//                       job.status
//                     )}`}
//                   >
//                     {formatStatus(job.status)}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">
//                       Description
//                     </h3>
//                     <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                       {job.description || "No description provided"}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                         <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Location
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {job.city || job.location?.city || "N/A"}
//                         </p>
//                         <p className="text-sm text-gray-500 dark:text-zinc-500">
//                           {job.postcode || job.location?.postcode || ""}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
//                         <CurrencyPoundIcon className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Budget Range
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           £{(job.budget_min || job.budgetMin || 0).toLocaleString()} - £
//                           {(job.budget_max || job.budgetMax || 0).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
//                         <CalendarIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Posted
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {formatDate(job.created_at || job.createdAt)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
//                         <UserCircleIcon className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Quotes Received
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {leads.length} Professional{leads.length !== 1 ? "s" : ""}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Content */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
//               <h3 className="text-lg font-black mb-2">Need Help?</h3>
//               <p className="text-sm text-blue-100 mb-4 leading-relaxed">
//                 Our team is here to assist you with your project
//               </p>
//               <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">
//                 Contact Support
//               </button>
//             </div>

//             {job.status === "HIRED" && job.hired_tradesperson_name && (
//               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
//                 <div className="flex items-center gap-2 mb-4">
//                   <CheckCircleIcon className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-gray-900 dark:text-white">
//                     Hired Professional
//                   </h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-gray-700 dark:text-zinc-300 font-semibold">
//                     {job.hired_tradesperson_name || "Professional"}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500">
//                     Hired on {formatDate(job.hired_at || job.hiredAt)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Leads/Quotes Section */}
//         <div className="mt-8">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//             <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">
//                 Quotes Received ({leads.length})
//               </h2>
//               <p className="text-gray-600 dark:text-zinc-400 mt-1">
//                 Review and compare quotes from professionals
//               </p>
//             </div>

//             <div className="p-8">
//               {leads.length === 0 ? (
//                 <div className="text-center py-12">
//                   <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
//                   <p className="text-gray-600 dark:text-zinc-400 font-bold">
//                     No quotes received yet
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
//                     Professionals will send you quotes soon
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                   {leads.map((lead) => (
//                     <div
//                       key={lead.id || lead._id}
//                       className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
//                     >
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
//                                   <p className="text-sm text-gray-600 dark:text-zinc-400">
//                                     {lead.company_name}
//                                   </p>
//                                 )}
//                                 <span
//                                   className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(
//                                     lead.status
//                                   )}`}
//                                 >
//                                   {formatStatus(lead.status)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             {lead.phone && (
//                               <div className="flex items-center gap-3">
//                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`tel:${lead.phone}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.phone}
//                                 </a>
//                               </div>
//                             )}
//                             {lead.email && (
//                               <div className="flex items-center gap-3">
//                                 <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`mailto:${lead.email}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.email}
//                                 </a>
//                               </div>
//                             )}
//                           </div>

//                           {lead.message && (
//                             <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
//                                 Quote Message
//                               </p>
//                               <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                                 {lead.message}
//                               </p>
//                             </div>
//                           )}

//                           {lead.price_estimate && (
//                             <div className="mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">
//                                 Price Estimate
//                               </p>
//                               <p className="text-2xl font-black text-[#155DFC]">
//                                 {lead.price_estimate}
//                               </p>
//                             </div>
//                           )}

//                           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
//                             <div>
//                               <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
//                               {formatDate(lead.created_at || lead.createdAt)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Action Button */}
//                         <div className="flex items-center">
//                           {job.status === "OPEN" && lead.status !== "HIRED" && (
//                             <button
//                               onClick={() => {
//                                 setSelectedLead(lead);
//                                 setShowHireModal(true);
//                               }}
//                               className="px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
//                             >
//                               Hire {lead.tradesperson_name || lead.company_name || "Professional"}
//                             </button>
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
//                   onClick={() => {
//                     setShowHireModal(false);
//                     setSelectedLead(null);
//                   }}
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
//     </div>
//   );
// }

























// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CurrencyPoundIcon,
//   UserCircleIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CheckCircleIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/outline";
// import {
//   CheckCircleIcon as CheckCircleSolid,
//   ExclamationTriangleIcon,
// } from "@heroicons/react/24/solid";

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
  
//   // Success/Error notification states
//   const [notification, setNotification] = useState({
//     show: false,
//     type: "success", // "success" or "error"
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
//         console.log("Job data:", data);
//         setJob(data.data || data);
//       } else {
//         console.error("Failed to fetch job details:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
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
//         console.log("Leads data:", data);
//         setLeads(Array.isArray(data) ? data : data.data || []);
//       } else {
//         console.error("Failed to fetch leads:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
//       }
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     }
//   }, [jobId]);

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

//   // Show notification function
//   const showNotification = (type, title, message) => {
//     setNotification({
//       show: true,
//       type,
//       title,
//       message,
//       icon: type === "success" ? CheckCircleSolid : ExclamationTriangleIcon,
//     });

//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, show: false }));
//     }, 5000);
//   };

//   // Handle hiring a tradesperson
//   const handleHire = async (leadId) => {
//     if (!jobId) {
//       showNotification(
//         "error",
//         "Error",
//         "Job ID is missing. Please refresh the page."
//       );
//       return;
//     }

//     setHiringInProgress(true);
//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ leadId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         showNotification(
//           "success",
//           "Success!",
//           "Tradesperson hired successfully! The job status has been updated."
//         );
//         await fetchJobDetails();
//         await fetchLeads();
//         setShowHireModal(false);
//         setSelectedLead(null);
//       } else {
//         showNotification(
//           "error",
//           "Failed to Hire",
//           data.message || "Failed to hire tradesperson. Please try again."
//         );
//       }
//     } catch (error) {
//       console.error("Error hiring tradesperson:", error);
//       showNotification(
//         "error",
//         "Something Went Wrong",
//         "An error occurred while processing your request. Please try again."
//       );
//     } finally {
//       setHiringInProgress(false);
//     }
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
//       {/* Notification Popup */}
//       {notification.show && (
//         <div className="fixed top-6 right-6 z-50 animate-fade-in">
//           <div className={`rounded-2xl shadow-2xl overflow-hidden min-w-[380px] ${
//             notification.type === "success" 
//               ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
//               : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800"
//           }`}>
//             <div className="p-6">
//               <div className="flex items-start gap-4">
//                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
//                   notification.type === "success"
//                     ? "bg-green-100 dark:bg-green-900"
//                     : "bg-red-100 dark:bg-red-900"
//                 }`}>
//                   {notification.type === "success" ? (
//                     <CheckCircleSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
//                   ) : (
//                     <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className={`text-lg font-black ${
//                     notification.type === "success"
//                       ? "text-green-800 dark:text-green-300"
//                       : "text-red-800 dark:text-red-300"
//                   }`}>
//                     {notification.title}
//                   </h3>
//                   <p className={`mt-1 ${
//                     notification.type === "success"
//                       ? "text-green-600 dark:text-green-400"
//                       : "text-red-600 dark:text-red-400"
//                   }`}>
//                     {notification.message}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setNotification(prev => ({ ...prev, show: false }))}
//                   className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
//                 >
//                   <XMarkIcon className="w-5 h-5" />
//                 </button>
//               </div>
//               {/* Progress bar */}
//               <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
//                 <div className={`h-full ${
//                   notification.type === "success"
//                     ? "bg-green-500 dark:bg-green-400"
//                     : "bg-red-500 dark:bg-red-400"
//                 } animate-progress`}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/homeowner"
//             className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4"
//           >
//             <ArrowLeftIcon className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
//             Job Details
//           </h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">
//             Manage quotes and hire professionals for your project
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Job Information Card */}
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
//                   <span
//                     className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(
//                       job.status
//                     )}`}
//                   >
//                     {formatStatus(job.status)}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">
//                       Description
//                     </h3>
//                     <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                       {job.description || "No description provided"}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                         <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Location
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {job.city || job.location?.city || "N/A"}
//                         </p>
//                         <p className="text-sm text-gray-500 dark:text-zinc-500">
//                           {job.postcode || job.location?.postcode || ""}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
//                         <CurrencyPoundIcon className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Budget Range
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           £{(job.budget_min || job.budgetMin || 0).toLocaleString()} - £
//                           {(job.budget_max || job.budgetMax || 0).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
//                         <CalendarIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Posted
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {formatDate(job.created_at || job.createdAt)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
//                         <UserCircleIcon className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Quotes Received
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {leads.length} Professional{leads.length !== 1 ? "s" : ""}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Content */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
//               <h3 className="text-lg font-black mb-2">Need Help?</h3>
//               <p className="text-sm text-blue-100 mb-4 leading-relaxed">
//                 Our team is here to assist you with your project
//               </p>
//               <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">
//                 Contact Support
//               </button>
//             </div>

//             {job.status === "HIRED" && job.hired_tradesperson_name && (
//               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
//                 <div className="flex items-center gap-2 mb-4">
//                   <CheckCircleIcon className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-gray-900 dark:text-white">
//                     Hired Professional
//                   </h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-gray-700 dark:text-zinc-300 font-semibold">
//                     {job.hired_tradesperson_name || "Professional"}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500">
//                     Hired on {formatDate(job.hired_at || job.hiredAt)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Leads/Quotes Section */}
//         <div className="mt-8">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//             <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">
//                 Quotes Received ({leads.length})
//               </h2>
//               <p className="text-gray-600 dark:text-zinc-400 mt-1">
//                 Review and compare quotes from professionals
//               </p>
//             </div>

//             <div className="p-8">
//               {leads.length === 0 ? (
//                 <div className="text-center py-12">
//                   <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
//                   <p className="text-gray-600 dark:text-zinc-400 font-bold">
//                     No quotes received yet
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
//                     Professionals will send you quotes soon
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                   {leads.map((lead) => (
//                     <div
//                       key={lead.id || lead._id}
//                       className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
//                     >
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
//                                   <p className="text-sm text-gray-600 dark:text-zinc-400">
//                                     {lead.company_name}
//                                   </p>
//                                 )}
//                                 <span
//                                   className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(
//                                     lead.status
//                                   )}`}
//                                 >
//                                   {formatStatus(lead.status)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             {lead.phone && (
//                               <div className="flex items-center gap-3">
//                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`tel:${lead.phone}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.phone}
//                                 </a>
//                               </div>
//                             )}
//                             {lead.email && (
//                               <div className="flex items-center gap-3">
//                                 <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`mailto:${lead.email}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.email}
//                                 </a>
//                               </div>
//                             )}
//                           </div>

//                           {lead.message && (
//                             <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
//                                 Quote Message
//                               </p>
//                               <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                                 {lead.message}
//                               </p>
//                             </div>
//                           )}

//                           {lead.price_estimate && (
//                             <div className="mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">
//                                 Price Estimate
//                               </p>
//                               <p className="text-2xl font-black text-[#155DFC]">
//                                 {lead.price_estimate}
//                               </p>
//                             </div>
//                           )}

//                           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
//                             <div>
//                               <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
//                               {formatDate(lead.created_at || lead.createdAt)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Action Button */}
//                         <div className="flex items-center">
//                           {job.status === "OPEN" && lead.status !== "HIRED" && (
//                             <button
//                               onClick={() => {
//                                 setSelectedLead(lead);
//                                 setShowHireModal(true);
//                               }}
//                               className="px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
//                             >
//                               Hire {lead.tradesperson_name || lead.company_name || "Professional"}
//                             </button>
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
//                   onClick={() => {
//                     setShowHireModal(false);
//                     setSelectedLead(null);
//                   }}
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

//       {/* Add CSS animations */}
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes progress {
//           from {
//             width: 100%;
//           }
//           to {
//             width: 0%;
//           }
//         }
        
//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-out;
//         }
        
//         .animate-progress {
//           animation: progress 5s linear forwards;
//         }
//       `}</style>
//     </div>
//   );
// }


















// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CurrencyPoundIcon,
//   UserCircleIcon,
//   PhoneIcon,
//   EnvelopeIcon,
//   CheckCircleIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
// } from "@heroicons/react/24/outline";
// import {
//   CheckCircleIcon as CheckCircleSolid,
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
  
//   // Success/Error notification states
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
//         console.log("Job data:", data);
//         setJob(data.data || data);
//       } else {
//         console.error("Failed to fetch job details:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
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
//         console.log("Leads data:", data);
//         setLeads(Array.isArray(data) ? data : data.data || []);
//       } else {
//         console.error("Failed to fetch leads:", res.status);
//         const errorData = await res.json();
//         console.error("Error:", errorData);
//       }
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     }
//   }, [jobId]);

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

//   // Show notification function
//   const showNotification = (type, title, message) => {
//     setNotification({
//       show: true,
//       type,
//       title,
//       message,
//       icon: type === "success" ? CheckCircleSolid : ExclamationTriangleIcon,
//     });

//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, show: false }));
//     }, 5000);
//   };

//   // Handle hiring a tradesperson
//   const handleHire = async (leadId) => {
//     if (!jobId) {
//       showNotification(
//         "error",
//         "Error",
//         "Job ID is missing. Please refresh the page."
//       );
//       return;
//     }

//     setHiringInProgress(true);
//     try {
//       const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ leadId }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         showNotification(
//           "success",
//           "Success!",
//           "Tradesperson hired successfully! The job status has been updated."
//         );
//         await fetchJobDetails();
//         await fetchLeads();
//         setShowHireModal(false);
//         setSelectedLead(null);
//       } else {
//         showNotification(
//           "error",
//           "Failed to Hire",
//           data.message || "Failed to hire tradesperson. Please try again."
//         );
//       }
//     } catch (error) {
//       console.error("Error hiring tradesperson:", error);
//       showNotification(
//         "error",
//         "Something Went Wrong",
//         "An error occurred while processing your request. Please try again."
//       );
//     } finally {
//       setHiringInProgress(false);
//     }
//   };

//   // Handle marking job as completed
//   const handleMarkAsCompleted = async () => {
//     if (!jobId || !user) {
//       toast.error("Please login to update job status");
//       return;
//     }

//     if (job.status !== 'HIRED') {
//       toast.error("Only HIRED jobs can be marked as completed");
//       return;
//     }

//     const confirmComplete = window.confirm(
//       "Mark this job as COMPLETED?\n\n✓ Work is finished\n✓ All payments are settled\n\nYou'll be able to rate the tradesperson after completion."
//     );

//     if (!confirmComplete) return;

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
//         body: JSON.stringify({ 
//           status: 'COMPLETED'
//         })
//       });

//       const data = await res.json();
//       toast.dismiss(loadingToast);

//       if (res.ok) {
//         toast.success("✅ Job marked as completed!");
//         // Refresh job data
//         await fetchJobDetails();
        
//         // Ask to rate tradesperson if available
//         setTimeout(() => {
//           if (job.hired_tradesperson_name || job.hiredTradesperson) {
//             const rate = window.confirm("Would you like to rate the tradesperson now?");
//             if (rate) {
//               router.push(`/homeowner/jobs/${jobId}/rate`);
//             }
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
      
//       {/* Notification Popup */}
//       {notification.show && (
//         <div className="fixed top-6 right-6 z-50 animate-fade-in">
//           <div className={`rounded-2xl shadow-2xl overflow-hidden min-w-[380px] ${
//             notification.type === "success" 
//               ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
//               : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800"
//           }`}>
//             <div className="p-6">
//               <div className="flex items-start gap-4">
//                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
//                   notification.type === "success"
//                     ? "bg-green-100 dark:bg-green-900"
//                     : "bg-red-100 dark:bg-red-900"
//                 }`}>
//                   {notification.type === "success" ? (
//                     <CheckCircleSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
//                   ) : (
//                     <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className={`text-lg font-black ${
//                     notification.type === "success"
//                       ? "text-green-800 dark:text-green-300"
//                       : "text-red-800 dark:text-red-300"
//                   }`}>
//                     {notification.title}
//                   </h3>
//                   <p className={`mt-1 ${
//                     notification.type === "success"
//                       ? "text-green-600 dark:text-green-400"
//                       : "text-red-600 dark:text-red-400"
//                   }`}>
//                     {notification.message}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setNotification(prev => ({ ...prev, show: false }))}
//                   className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
//                 >
//                   <XMarkIcon className="w-5 h-5" />
//                 </button>
//               </div>
//               {/* Progress bar */}
//               <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
//                 <div className={`h-full ${
//                   notification.type === "success"
//                     ? "bg-green-500 dark:bg-green-400"
//                     : "bg-red-500 dark:bg-red-400"
//                 } animate-progress`}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/homeowner"
//             className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4"
//           >
//             <ArrowLeftIcon className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Link>
//           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
//             Job Details
//           </h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">
//             Manage quotes and hire professionals for your project
//           </p>
//         </div>

//         {/* Quick Action Banner for HIRED jobs */}
//         {job.status === 'HIRED' && (
//           <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//                 <div>
//                   <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Job In Progress</h3>
//                   <p className="text-sm text-yellow-600 dark:text-yellow-400">
//                     Has the work been completed? Mark this job as completed when finished.
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleMarkAsCompleted}
//                 disabled={updatingStatus}
//                 className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
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

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Job Information Card */}
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
//                   <span
//                     className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(
//                       job.status
//                     )}`}
//                   >
//                     {formatStatus(job.status)}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-8">
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">
//                       Description
//                     </h3>
//                     <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                       {job.description || "No description provided"}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
//                         <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Location
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {job.city || job.location?.city || "N/A"}
//                         </p>
//                         <p className="text-sm text-gray-500 dark:text-zinc-500">
//                           {job.postcode || job.location?.postcode || ""}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
//                         <CurrencyPoundIcon className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Budget Range
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           £{(job.budget_min || job.budgetMin || 0).toLocaleString()} - £
//                           {(job.budget_max || job.budgetMax || 0).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
//                         <CalendarIcon className="w-5 h-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Posted
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {formatDate(job.created_at || job.createdAt)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
//                         <UserCircleIcon className="w-5 h-5 text-orange-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
//                           Quotes Received
//                         </p>
//                         <p className="text-gray-900 dark:text-white font-semibold mt-1">
//                           {leads.length} Professional{leads.length !== 1 ? "s" : ""}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Content */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
//               <h3 className="text-lg font-black mb-2">Need Help?</h3>
//               <p className="text-sm text-blue-100 mb-4 leading-relaxed">
//                 Our team is here to assist you with your project
//               </p>
//               <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">
//                 Contact Support
//               </button>
//             </div>

//             {job.status === "HIRED" && job.hired_tradesperson_name && (
//               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
//                 <div className="flex items-center gap-2 mb-4">
//                   <CheckCircleIcon className="w-6 h-6 text-green-600" />
//                   <h3 className="text-lg font-black text-gray-900 dark:text-white">
//                     Hired Professional
//                   </h3>
//                 </div>
//                 <div className="space-y-3">
//                   <p className="text-gray-700 dark:text-zinc-300 font-semibold">
//                     {job.hired_tradesperson_name || "Professional"}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500">
//                     Hired on {formatDate(job.hired_at || job.hiredAt)}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Leads/Quotes Section */}
//         <div className="mt-8">
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
//             <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">
//                 Quotes Received ({leads.length})
//               </h2>
//               <p className="text-gray-600 dark:text-zinc-400 mt-1">
//                 Review and compare quotes from professionals
//               </p>
//             </div>

//             <div className="p-8">
//               {leads.length === 0 ? (
//                 <div className="text-center py-12">
//                   <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
//                   <p className="text-gray-600 dark:text-zinc-400 font-bold">
//                     No quotes received yet
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
//                     Professionals will send you quotes soon
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                   {leads.map((lead) => (
//                     <div
//                       key={lead.id || lead._id}
//                       className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
//                     >
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
//                                   <p className="text-sm text-gray-600 dark:text-zinc-400">
//                                     {lead.company_name}
//                                   </p>
//                                 )}
//                                 <span
//                                   className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(
//                                     lead.status
//                                   )}`}
//                                 >
//                                   {formatStatus(lead.status)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             {lead.phone && (
//                               <div className="flex items-center gap-3">
//                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`tel:${lead.phone}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.phone}
//                                 </a>
//                               </div>
//                             )}
//                             {lead.email && (
//                               <div className="flex items-center gap-3">
//                                 <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                 <a
//                                   href={`mailto:${lead.email}`}
//                                   className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
//                                 >
//                                   {lead.email}
//                                 </a>
//                               </div>
//                             )}
//                           </div>

//                           {lead.message && (
//                             <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
//                                 Quote Message
//                               </p>
//                               <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
//                                 {lead.message}
//                               </p>
//                             </div>
//                           )}

//                           {lead.price_estimate && (
//                             <div className="mb-4">
//                               <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">
//                                 Price Estimate
//                               </p>
//                               <p className="text-2xl font-black text-[#155DFC]">
//                                 {lead.price_estimate}
//                               </p>
//                             </div>
//                           )}

//                           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
//                             <div>
//                               <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
//                               {formatDate(lead.created_at || lead.createdAt)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Action Button */}
//                         <div className="flex items-center">
//                           {job.status === "OPEN" && lead.status !== "HIRED" && (
//                             <button
//                               onClick={() => {
//                                 setSelectedLead(lead);
//                                 setShowHireModal(true);
//                               }}
//                               className="px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
//                             >
//                               Hire {lead.tradesperson_name || lead.company_name || "Professional"}
//                             </button>
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
//                   onClick={() => {
//                     setShowHireModal(false);
//                     setSelectedLead(null);
//                   }}
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

//       {/* Add CSS animations */}
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes progress {
//           from {
//             width: 100%;
//           }
//           to {
//             width: 0%;
//           }
//         }
        
//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-out;
//         }
        
//         .animate-progress {
//           animation: progress 5s linear forwards;
//         }
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
  CurrencyPoundIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  StarIcon,
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
  
  // Success/Error notification states
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
        console.log("Job data:", data);
        setJob(data.data || data);
      } else {
        console.error("Failed to fetch job details:", res.status);
        const errorData = await res.json();
        console.error("Error:", errorData);
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
        console.log("Leads data:", data);
        setLeads(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error("Failed to fetch leads:", res.status);
        const errorData = await res.json();
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }, [jobId]);

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

  // Show notification function
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      icon: type === "success" ? CheckCircleSolid : ExclamationTriangleIcon,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Handle hiring a tradesperson
  const handleHire = async (leadId) => {
    if (!jobId) {
      showNotification(
        "error",
        "Error",
        "Job ID is missing. Please refresh the page."
      );
      return;
    }

    setHiringInProgress(true);
    try {
      const res = await fetch(`/api/homeowner/jobs/${jobId}/hire`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(
          "success",
          "Success!",
          "Tradesperson hired successfully! The job status has been updated."
        );
        await fetchJobDetails();
        await fetchLeads();
        setShowHireModal(false);
        setSelectedLead(null);
      } else {
        showNotification(
          "error",
          "Failed to Hire",
          data.message || "Failed to hire tradesperson. Please try again."
        );
      }
    } catch (error) {
      console.error("Error hiring tradesperson:", error);
      showNotification(
        "error",
        "Something Went Wrong",
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setHiringInProgress(false);
    }
  };

  // Handle marking job as completed
  const handleMarkAsCompleted = async () => {
    if (!jobId || !user) {
      toast.error("Please login to update job status");
      return;
    }

    if (job.status !== 'HIRED') {
      toast.error("Only HIRED jobs can be marked as completed");
      return;
    }

    const confirmComplete = window.confirm(
      "Mark this job as COMPLETED?\n\n✓ Work is finished\n✓ All payments are settled\n\nYou'll be able to rate the tradesperson after completion."
    );

    if (!confirmComplete) return;

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
        body: JSON.stringify({ 
          status: 'COMPLETED'
        })
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("✅ Job marked as completed!");
        // Refresh job data
        await fetchJobDetails();
        
        // Ask to rate tradesperson if available (DON'T auto-redirect)
        setTimeout(() => {
          if (job.hired_tradesperson_name || job.hiredTradespersonName) {
            const rate = window.confirm("Would you like to rate the tradesperson now?");
            if (rate) {
              router.push(`/homeowner/jobs/${jobId}/rate`);
            }
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

  // NEW: Handle navigate to rating page
  const handleNavigateToRating = () => {
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
      
      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`rounded-2xl shadow-2xl overflow-hidden min-w-[380px] ${
            notification.type === "success" 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
              : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 border border-red-200 dark:border-red-800"
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.type === "success"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}>
                  {notification.type === "success" ? (
                    <CheckCircleSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-black ${
                    notification.type === "success"
                      ? "text-green-800 dark:text-green-300"
                      : "text-red-800 dark:text-red-300"
                  }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 ${
                    notification.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full ${
                  notification.type === "success"
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-red-500 dark:bg-red-400"
                } animate-progress`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/homeowner"
            className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Job Details
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            Manage quotes and hire professionals for your project
          </p>
        </div>

        {/* Quick Action Banner for HIRED jobs */}
        {job.status === 'HIRED' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Job In Progress</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Has the work been completed? Mark this job as completed when finished.
                  </p>
                </div>
              </div>
              <button
                onClick={handleMarkAsCompleted}
                disabled={updatingStatus}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* NEW: Quick Action Banner for COMPLETED jobs without rating */}
        {job.status === 'COMPLETED' && !job.hasRated && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300">Rate Your Experience</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    How was your experience with {job.hired_tradesperson_name || job.hiredTradespersonName}? Your feedback helps others.
                  </p>
                </div>
              </div>
              <button
                onClick={handleNavigateToRating}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg"
              >
                <StarIconSolid className="w-4 h-4" />
                Rate Tradesperson
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Information Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#155DFC] to-indigo-600 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">
                      {job.category_name || job.category?.name || "Job"}
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {job.subcategory_name || job.subCategory?.name || "Details"}
                    </h2>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {formatStatus(job.status)}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                      {job.description || "No description provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 text-[#155DFC]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Location
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          {job.city || job.location?.city || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500">
                          {job.postcode || job.location?.postcode || ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <CurrencyPoundIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Budget Range
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          £{(job.budget_min || job.budgetMin || 0).toLocaleString()} - £
                          {(job.budget_max || job.budgetMax || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Posted
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          {formatDate(job.created_at || job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                        <UserCircleIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Quotes Received
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          {leads.length} Professional{leads.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#155DFC] to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-lg font-black mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                Our team is here to assist you with your project
              </p>
              <button className="w-full py-3 bg-white text-[#155DFC] font-bold rounded-2xl hover:bg-blue-50 transition-all">
                Contact Support
              </button>
            </div>

            {job.status === "HIRED" && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Hired Professional
                  </h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-zinc-300 font-semibold">
                    {job.hired_tradesperson_name || job.hiredTradespersonName || "Professional"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">
                    Hired on {formatDate(job.hired_at || job.hiredAt)}
                  </p>
                </div>
              </div>
            )}

            {/* NEW: Show Rating Card for COMPLETED jobs */}
            {job.status === "COMPLETED" && (job.hired_tradesperson_name || job.hiredTradespersonName) && (
              <div className={`rounded-3xl border p-6 ${
                job.hasRated
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  {job.hasRated ? (
                    <>
                      <StarIconSolid className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-black text-green-900 dark:text-green-300">
                        Rating Submitted
                      </h3>
                    </>
                  ) : (
                    <>
                      <StarIcon className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">
                        Pending Rating
                      </h3>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <p className={`text-sm ${
                    job.hasRated
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {job.hasRated
                      ? "Thank you for rating this tradesperson!"
                      : "Please rate your experience to help others"}
                  </p>
                  {!job.hasRated && (
                    <button
                      onClick={handleNavigateToRating}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <StarIconSolid className="w-4 h-4" />
                      Rate Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leads/Quotes Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Quotes Received ({leads.length})
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 mt-1">
                Review and compare quotes from professionals
              </p>
            </div>

            <div className="p-8">
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
                  <p className="text-gray-600 dark:text-zinc-400 font-bold">
                    No quotes received yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
                    Professionals will send you quotes soon
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {leads.map((lead) => (
                    <div
                      key={lead.id || lead._id}
                      className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Professional Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#155DFC] to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                {(lead.tradesperson_name || lead.company_name || "P")[0]?.toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                  {lead.tradesperson_name || lead.company_name || "Professional"}
                                </h3>
                                {lead.company_name && lead.tradesperson_name && (
                                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                                    {lead.company_name}
                                  </p>
                                )}
                                <span
                                  className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mt-2 ${getStatusColor(
                                    lead.status
                                  )}`}
                                >
                                  {formatStatus(lead.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {lead.phone && (
                              <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="text-sm text-gray-700 dark:text-zinc-300 hover:text-[#155DFC]"
                                >
                                  {lead.email}
                                </a>
                              </div>
                            )}
                          </div>

                          {lead.message && (
                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4">
                              <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                                Quote Message
                              </p>
                              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                                {lead.message}
                              </p>
                            </div>
                          )}

                          {lead.price_estimate && (
                            <div className="mb-4">
                              <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1">
                                Price Estimate
                              </p>
                              <p className="text-2xl font-black text-[#155DFC]">
                                {lead.price_estimate}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
                            <div>
                              <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
                              {formatDate(lead.created_at || lead.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center">
                          {job.status === "OPEN" && lead.status !== "HIRED" && (
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowHireModal(true);
                              }}
                              className="px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                            >
                              Hire {lead.tradesperson_name || lead.company_name || "Professional"}
                            </button>
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
                  onClick={() => {
                    setShowHireModal(false);
                    setSelectedLead(null);
                  }}
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

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}