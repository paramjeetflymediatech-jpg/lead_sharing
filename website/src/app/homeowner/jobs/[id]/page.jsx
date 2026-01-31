// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { toast } from "react-hot-toast";
// import {
//     ArrowLeftIcon,
//     MapPinIcon,
//     CalendarIcon,
//     BanknotesIcon,
//     UserIcon,
//     PhoneIcon,
//     EnvelopeIcon,
//     BuildingOfficeIcon,
//     ClockIcon,
//     CheckCircleIcon,
//     XCircleIcon,
//     ChatBubbleLeftRightIcon,
// } from "@heroicons/react/24/outline";
// import { StarIcon } from "@heroicons/react/24/solid";

// export default function JobDetailsPage() {
//     const router = useRouter();
//     const params = useParams(); // ✅ useParams का use करें
//     const [jobData, setJobData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState("details");
//     const [user, setUser] = useState(null);
//     const [jobId, setJobId] = useState(null);

//     // ✅ जैसे job form में user fetch किया था, वैसे ही यहाँ करें
//     const fetchUser = useCallback(async () => {
//         try {
//             const res = await fetch("/api/me", {
//                 credentials: "include",
//                 cache: "no-store",
//             });
            
//             if (res.ok) {
//                 const userData = await res.json();
//                 setUser(userData);
//             } else {
//                 setUser(null);
//             }
//         } catch (error) {
//             console.error("Error fetching user:", error);
//             setUser(null);
//         }
//     }, []);

//     // ✅ सबसे पहले user fetch करें और params से jobId निकालें
//     useEffect(() => {
//         fetchUser();
        
//         if (!params) return;
        
//         // App Router में dynamic route parameter को सही तरीके से access करें
//         // Check all possible param names
//         const id = params.jobId || params.id || params.slug;
        
//         // Debug log
//         console.log("All params:", params);
//         console.log("Extracted jobId:", id);
        
//         if (!id || id === "undefined") {
//             console.error("Invalid job ID from params:", id);
//             toast.error("Invalid job link");
//             router.push("/homeowner/my-jobs");
//             return;
//         }
        
//         setJobId(id);
//     }, [params, router, fetchUser]);

//     // ✅ जब jobId मिल जाए, तब fetch करें
//     useEffect(() => {
//         if (!jobId) return;
        
//         fetchJobDetails();
//     }, [jobId]);

//     const fetchJobDetails = async () => {
//         try {
//             setLoading(true);
//             console.log("Fetching job details for ID:", jobId);
            
//             const res = await fetch(`/api/homeowner/my-jobs/${jobId}`, {
//                 credentials: "include",
//             });

//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.message || "Failed to fetch job details");
//             }

//             const data = await res.json();
            
//             if (!data.success) {
//                 throw new Error(data.message || "Failed to fetch job details");
//             }

//             setJobData(data.data);
//         } catch (error) {
//             console.error("Error fetching job details:", error);
//             toast.error(error.message || "Failed to load job details");
//             router.push("/homeowner/my-jobs");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ अगर params से jobId नहीं मिल रहा तो एक alternative solution
//     // यह check करें कि URL से jobId extract करें
//     useEffect(() => {
//         if (params && Object.keys(params).length === 0) {
//             // Try to get from URL
//             const pathParts = window.location.pathname.split('/');
//             const possibleId = pathParts[pathParts.length - 1];
            
//             if (possibleId && possibleId !== "undefined" && possibleId !== "my-jobs") {
//                 console.log("Extracted jobId from URL:", possibleId);
//                 setJobId(possibleId);
//             }
//         }
//     }, [params]);

//     const formatDate = (dateString) => {
//         return new Date(dateString).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

//     const formatTime = (dateString) => {
//         return new Date(dateString).toLocaleTimeString("en-US", {
//             hour: "2-digit",
//             minute: "2-digit",
//         });
//     };

//     const getStatusBadge = (status) => {
//         const statusConfig = {
//             OPEN: { color: "bg-green-100 text-green-800 border-green-200", label: "Open" },
//             IN_PROGRESS: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
//             COMPLETED: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Completed" },
//             CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
//         };

//         const config = statusConfig[status] || statusConfig.OPEN;
//         return (
//             <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
//                 {config.label}
//             </span>
//         );
//     };

//     const getStartTimeLabel = (startTime) => {
//         const labels = {
//             URGENT: "Urgent",
//             WITHIN_2_DAYS: "Within 2 Days",
//             WITHIN_2_WEEKS: "Within 2 Weeks",
//             WITHIN_2_MONTHS: "Within 2 Months",
//             FLEXIBLE: "Flexible",
//         };
//         return labels[startTime] || startTime;
//     };

//     const getJobStageLabel = (stage) => {
//         const labels = {
//             READY_TO_HIRE: "Ready to Hire",
//             PLANNING: "Planning",
//             INSURANCE_WORK: "Insurance Work",
//         };
//         return labels[stage] || stage;
//     };

//     // ✅ Initial loading state - check for jobId
//     if (!jobId && !loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mx-auto mb-4"></div>
//                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Job Details...</h2>
//                     <p className="text-gray-600 mb-6">Please wait while we fetch the job information</p>
//                 </div>
//             </div>
//         );
//     }

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
//                     <p className="text-gray-600 font-medium">Loading job details...</p>
//                     <p className="text-sm text-gray-500">Job ID: {jobId}</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!jobData) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
//                     <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or you don't have permission to view it.</p>
//                     <button
//                         onClick={() => router.push("/homeowner/my-jobs")}
//                         className="bg-[#1149C7] text-white px-6 py-2 rounded-lg hover:bg-[#0d38a0] transition"
//                     >
//                         Back to My Jobs
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const { job, leads, summary } = jobData;

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <button
//                         onClick={() => router.push("/homeowner/my-jobs")}
//                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
//                     >
//                         <ArrowLeftIcon className="w-5 h-5" />
//                         <span className="font-medium">Back to My Jobs</span>
//                     </button>

//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                                 {job.category?.name || "Job Details"}
//                             </h1>
//                             <p className="text-gray-600">
//                                 {job.subCategory?.name} • Posted {formatDate(job.createdAt)}
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-3">
//                             {getStatusBadge(job.status)}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="border-b border-gray-200 mb-6">
//                     <div className="flex gap-8">
//                         <button
//                             onClick={() => setActiveTab("details")}
//                             className={`pb-3 border-b-2 font-semibold transition ${
//                                 activeTab === "details"
//                                     ? "border-[#1149C7] text-[#1149C7]"
//                                     : "border-transparent text-gray-500 hover:text-gray-700"
//                             }`}
//                         >
//                             Job Details
//                         </button>
//                         <button
//                             onClick={() => setActiveTab("leads")}
//                             className={`pb-3 border-b-2 font-semibold transition flex items-center gap-2 ${
//                                 activeTab === "leads"
//                                     ? "border-[#1149C7] text-[#1149C7]"
//                                     : "border-transparent text-gray-500 hover:text-gray-700"
//                             }`}
//                         >
//                             Received Leads
//                             {summary.totalLeads > 0 && (
//                                 <span className="bg-[#1149C7] text-white text-xs px-2 py-0.5 rounded-full">
//                                     {summary.totalLeads}
//                                 </span>
//                             )}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Main Content */}
//                     <div className="lg:col-span-2">
//                         {activeTab === "details" && (
//                             <div className="space-y-6">
//                                 {/* Job Description */}
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                     <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
//                                     <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
//                                         {job.description}
//                                     </p>
//                                 </div>

//                                 {/* Budget */}
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                     <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                         <BanknotesIcon className="w-6 h-6 text-[#1149C7]" />
//                                         Budget
//                                     </h2>
//                                     <div className="flex items-center gap-4">
//                                         <div className="flex-1">
//                                             <p className="text-sm text-gray-500 mb-1">Minimum</p>
//                                             <p className="text-2xl font-bold text-gray-900">
//                                                 £{job.budgetMin?.toLocaleString() || 0}
//                                             </p>
//                                         </div>
//                                         <div className="text-gray-400">—</div>
//                                         <div className="flex-1">
//                                             <p className="text-sm text-gray-500 mb-1">Maximum</p>
//                                             <p className="text-2xl font-bold text-gray-900">
//                                                 £{job.budgetMax?.toLocaleString() || 0}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Timeline & Stage */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                         <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                             <ClockIcon className="w-5 h-5 text-[#1149C7]" />
//                                             Start Time
//                                         </h3>
//                                         <p className="text-gray-700 font-medium">
//                                             {getStartTimeLabel(job.startTime)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                         <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                             <CheckCircleIcon className="w-5 h-5 text-[#1149C7]" />
//                                             Project Stage
//                                         </h3>
//                                         <p className="text-gray-700 font-medium">
//                                             {getJobStageLabel(job.jobStage)}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Media */}
//                                 {job.media && job.media.length > 0 && (
//                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                         <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
//                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                                             {job.media.map((item, index) => (
//                                                 <div key={index} className="relative group">
//                                                     {item.type === "IMAGE" ? (
//                                                         <img
//                                                             src={item.url}
//                                                             alt={`Job media ${index + 1}`}
//                                                             className="w-full h-40 object-cover rounded-lg border border-gray-200"
//                                                         />
//                                                     ) : (
//                                                         <video
//                                                             src={item.url}
//                                                             controls
//                                                             className="w-full h-40 object-cover rounded-lg border border-gray-200"
//                                                         />
//                                                     )}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === "leads" && (
//                             <div className="space-y-4">
//                                 {leads && leads.length > 0 ? (
//                                     leads.map((lead) => (
//                                         <div
//                                             key={lead._id}
//                                             className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
//                                         >
//                                             {/* Tradesperson Header */}
//                                             <div className="flex items-start gap-4 mb-4">
//                                                 <div className="w-12 h-12 rounded-full bg-[#1149C7] flex items-center justify-center text-white font-bold text-lg">
//                                                     {lead.tradesperson?.user?.name?.charAt(0).toUpperCase() || "T"}
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <h3 className="font-bold text-lg text-gray-900">
//                                                         {lead.tradesperson?.user?.name || "Anonymous Tradesperson"}
//                                                     </h3>
//                                                     <p className="text-gray-600 flex items-center gap-1">
//                                                         <BuildingOfficeIcon className="w-4 h-4" />
//                                                         {lead.tradesperson?.companyName || "No company info"}
//                                                     </p>
//                                                 </div>
//                                                 <div className="text-right">
//                                                     <p className="text-sm text-gray-500">Received</p>
//                                                     <p className="text-sm font-semibold text-gray-900">
//                                                         {formatDate(lead.createdAt)}
//                                                     </p>
//                                                     <p className="text-xs text-gray-500">
//                                                         {formatTime(lead.createdAt)}
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             {/* Message */}
//                                             <div className="mb-4 bg-gray-50 rounded-lg p-4">
//                                                 <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                                                     <ChatBubbleLeftRightIcon className="w-4 h-4" />
//                                                     Message
//                                                 </p>
//                                                 <p className="text-gray-700 whitespace-pre-wrap">
//                                                     {lead.message || "No message provided"}
//                                                 </p>
//                                             </div>

//                                             {/* Price Estimate */}
//                                             {lead.priceEstimate && (
//                                                 <div className="mb-4">
//                                                     <p className="text-sm font-semibold text-gray-700 mb-1">
//                                                         Price Estimate
//                                                     </p>
//                                                     <p className="text-2xl font-bold text-[#1149C7]">
//                                                         £{lead.priceEstimate.toLocaleString()}
//                                                     </p>
//                                                 </div>
//                                             )}

//                                             {/* Contact Info (if unlocked) */}
//                                             {lead.isUnlocked && (
//                                                 <div className="border-t border-gray-200 pt-4 mt-4">
//                                                     <p className="text-sm font-semibold text-gray-700 mb-3">
//                                                         Contact Information
//                                                     </p>
//                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                                         <div className="flex items-center gap-2 text-gray-700">
//                                                             <EnvelopeIcon className="w-5 h-5 text-gray-400" />
//                                                             <a
//                                                                 href={`mailto:${lead.tradesperson?.user?.email}`}
//                                                                 className="hover:text-[#1149C7] transition"
//                                                             >
//                                                                 {lead.tradesperson?.user?.email}
//                                                             </a>
//                                                         </div>
//                                                         {lead.tradesperson?.user?.phone && (
//                                                             <div className="flex items-center gap-2 text-gray-700">
//                                                                 <PhoneIcon className="w-5 h-5 text-gray-400" />
//                                                                 <a
//                                                                     href={`tel:${lead.tradesperson?.user?.phone}`}
//                                                                     className="hover:text-[#1149C7] transition"
//                                                                 >
//                                                                     {lead.tradesperson?.user?.phone}
//                                                                 </a>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             )}

//                                             {/* Unlocked Badge */}
//                                             {lead.isUnlocked && (
//                                                 <div className="mt-4">
//                                                     <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
//                                                         <CheckCircleIcon className="w-4 h-4" />
//                                                         Contact Details Unlocked
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//                                         <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                                         <h3 className="text-xl font-bold text-gray-900 mb-2">
//                                             No Leads Yet
//                                         </h3>
//                                         <p className="text-gray-600">
//                                             Tradespeople will send you quotes for this job soon.
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Sidebar */}
//                     <div className="lg:col-span-1">
//                         <div className="space-y-6 sticky top-6">
//                             {/* Location */}
//                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-[#1149C7]" />
//                                     Location
//                                 </h3>
//                                 <p className="text-gray-700 font-medium mb-1">
//                                     {job.location?.postcode || "N/A"}
//                                 </p>
//                                 {job.location?.city && (
//                                     <p className="text-gray-600 text-sm">{job.location.city}</p>
//                                 )}
//                             </div>

//                             {/* Contact Info */}
//                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                     <UserIcon className="w-5 h-5 text-[#1149C7]" />
//                                     Your Contact Info
//                                 </h3>
//                                 <div className="space-y-3">
//                                     <div>
//                                         <p className="text-xs text-gray-500 mb-1">Name</p>
//                                         <p className="text-gray-900 font-medium">{job.contactName}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-gray-500 mb-1">Phone</p>
//                                         <p className="text-gray-900 font-medium">{job.contactPhone}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-xs text-gray-500 mb-1">Email</p>
//                                         <p className="text-gray-900 font-medium break-all">
//                                             {job.contactEmail}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Quick Stats */}
//                             <div className="bg-gradient-to-br from-[#1149C7] to-[#0d38a0] rounded-lg shadow-sm p-6 text-white">
//                                 <h3 className="font-semibold mb-4">Lead Summary</h3>
//                                 <div className="space-y-3">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-white/80">Total Leads</span>
//                                         <span className="text-2xl font-bold">{summary.totalLeads}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-white/80">Status</span>
//                                         <span className="font-semibold capitalize">{job.status}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
































"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams(); // ✅ FIX: Use useParams hook for client component
  const jobId = params?.jobId || params?.id; // ✅ Get jobId from params
  
  const [job, setJob] = useState(null);
  const [leads, setLeads] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiringInProgress, setHiringInProgress] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);

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
        router.push("/login");
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

  // Handle hiring a tradesperson
  const handleHire = async (leadId) => {
    if (!jobId) {
      alert("Job ID is missing");
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
        // Success - refresh data
        await fetchJobDetails();
        await fetchLeads();
        setShowHireModal(false);
        setSelectedLead(null);
      } else {
        alert(data.message || "Failed to hire tradesperson");
      }
    } catch (error) {
      console.error("Error hiring tradesperson:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setHiringInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <Link href="/homeowner" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/homeowner"
            className="inline-flex items-center text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Information Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">
                      {job.category?.name}
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {job.subCategory?.name}
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
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Location
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          {job.location?.city}, {job.location?.state}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500">
                          {job.location?.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                          Budget Range
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">
                          ₹{job.budgetMin?.toLocaleString()} - ₹
                          {job.budgetMax?.toLocaleString()}
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
                          {formatDate(job.createdAt)}
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-lg font-black mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                Our team is here to assist you with your project
              </p>
              <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all">
                Contact Support
              </button>
            </div>

            {job.status === "HIRED" && job.hiredTradesperson && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Hired Professional
                  </h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-zinc-300 font-semibold">
                    {job.hiredTradesperson.companyName || "Professional"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">
                    Hired on {formatDate(job.hiredAt)}
                  </p>
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
                      key={lead._id}
                      className="group border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Professional Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                {lead.tradesperson?.companyName?.[0]?.toUpperCase() || "P"}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                  {lead.tradesperson?.companyName || "Professional"}
                                </h3>
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
                            {lead.tradesperson?.phone && (
                              <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                  {lead.tradesperson.phone}
                                </span>
                              </div>
                            )}
                            {lead.tradesperson?.user?.email && (
                              <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-zinc-300">
                                  {lead.tradesperson.user.email}
                                </span>
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

                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
                            <div>
                              <span className="font-bold uppercase tracking-widest">Submitted:</span>{" "}
                              {formatDate(lead.createdAt)}
                            </div>
                            {lead.tradesperson?.credits !== undefined && (
                              <div>
                                <span className="font-bold uppercase tracking-widest">Credits:</span>{" "}
                                {lead.tradesperson.credits}
                              </div>
                            )}
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
                              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                            >
                              Hire Now
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-black text-white">Confirm Hire</h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 dark:text-zinc-300 mb-6 leading-relaxed">
                Are you sure you want to hire{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedLead.tradesperson?.companyName}
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
                  onClick={() => handleHire(selectedLead._id)}
                  disabled={hiringInProgress}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hiringInProgress ? "Hiring..." : "Confirm Hire"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}