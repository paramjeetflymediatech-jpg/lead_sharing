"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ArrowLeftIcon,
    MapPinIcon,
    CalendarIcon,
    BanknotesIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function JobDetailsPage() {
    const router = useRouter();
    const params = useParams(); // ✅ useParams का use करें
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [user, setUser] = useState(null);
    const [jobId, setJobId] = useState(null);

    // ✅ जैसे job form में user fetch किया था, वैसे ही यहाँ करें
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
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        }
    }, []);

    // ✅ सबसे पहले user fetch करें और params से jobId निकालें
    useEffect(() => {
        fetchUser();
        
        if (!params) return;
        
        // App Router में dynamic route parameter को सही तरीके से access करें
        // Check all possible param names
        const id = params.jobId || params.id || params.slug;
        
        // Debug log
        console.log("All params:", params);
        console.log("Extracted jobId:", id);
        
        if (!id || id === "undefined") {
            console.error("Invalid job ID from params:", id);
            toast.error("Invalid job link");
            router.push("/homeowner/my-jobs");
            return;
        }
        
        setJobId(id);
    }, [params, router, fetchUser]);

    // ✅ जब jobId मिल जाए, तब fetch करें
    useEffect(() => {
        if (!jobId) return;
        
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            console.log("Fetching job details for ID:", jobId);
            
            const res = await fetch(`/api/homeowner/my-jobs/${jobId}`, {
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch job details");
            }

            const data = await res.json();
            
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch job details");
            }

            setJobData(data.data);
        } catch (error) {
            console.error("Error fetching job details:", error);
            toast.error(error.message || "Failed to load job details");
            router.push("/homeowner/my-jobs");
        } finally {
            setLoading(false);
        }
    };

    // ✅ अगर params से jobId नहीं मिल रहा तो एक alternative solution
    // यह check करें कि URL से jobId extract करें
    useEffect(() => {
        if (params && Object.keys(params).length === 0) {
            // Try to get from URL
            const pathParts = window.location.pathname.split('/');
            const possibleId = pathParts[pathParts.length - 1];
            
            if (possibleId && possibleId !== "undefined" && possibleId !== "my-jobs") {
                console.log("Extracted jobId from URL:", possibleId);
                setJobId(possibleId);
            }
        }
    }, [params]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            OPEN: { color: "bg-green-100 text-green-800 border-green-200", label: "Open" },
            IN_PROGRESS: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
            COMPLETED: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Completed" },
            CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
        };

        const config = statusConfig[status] || statusConfig.OPEN;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStartTimeLabel = (startTime) => {
        const labels = {
            URGENT: "Urgent",
            WITHIN_2_DAYS: "Within 2 Days",
            WITHIN_2_WEEKS: "Within 2 Weeks",
            WITHIN_2_MONTHS: "Within 2 Months",
            FLEXIBLE: "Flexible",
        };
        return labels[startTime] || startTime;
    };

    const getJobStageLabel = (stage) => {
        const labels = {
            READY_TO_HIRE: "Ready to Hire",
            PLANNING: "Planning",
            INSURANCE_WORK: "Insurance Work",
        };
        return labels[stage] || stage;
    };

    // ✅ Initial loading state - check for jobId
    if (!jobId && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Job Details...</h2>
                    <p className="text-gray-600 mb-6">Please wait while we fetch the job information</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
                    <p className="text-gray-600 font-medium">Loading job details...</p>
                    <p className="text-sm text-gray-500">Job ID: {jobId}</p>
                </div>
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or you don't have permission to view it.</p>
                    <button
                        onClick={() => router.push("/homeowner/my-jobs")}
                        className="bg-[#1149C7] text-white px-6 py-2 rounded-lg hover:bg-[#0d38a0] transition"
                    >
                        Back to My Jobs
                    </button>
                </div>
            </div>
        );
    }

    const { job, leads, summary } = jobData;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/homeowner/my-jobs")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="font-medium">Back to My Jobs</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {job.category?.name || "Job Details"}
                            </h1>
                            <p className="text-gray-600">
                                {job.subCategory?.name} • Posted {formatDate(job.createdAt)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(job.status)}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`pb-3 border-b-2 font-semibold transition ${
                                activeTab === "details"
                                    ? "border-[#1149C7] text-[#1149C7]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Job Details
                        </button>
                        <button
                            onClick={() => setActiveTab("leads")}
                            className={`pb-3 border-b-2 font-semibold transition flex items-center gap-2 ${
                                activeTab === "leads"
                                    ? "border-[#1149C7] text-[#1149C7]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Received Leads
                            {summary.totalLeads > 0 && (
                                <span className="bg-[#1149C7] text-white text-xs px-2 py-0.5 rounded-full">
                                    {summary.totalLeads}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === "details" && (
                            <div className="space-y-6">
                                {/* Job Description */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>

                                {/* Budget */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BanknotesIcon className="w-6 h-6 text-[#1149C7]" />
                                        Budget
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500 mb-1">Minimum</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                £{job.budgetMin?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                        <div className="text-gray-400">—</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500 mb-1">Maximum</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                £{job.budgetMax?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline & Stage */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <ClockIcon className="w-5 h-5 text-[#1149C7]" />
                                            Start Time
                                        </h3>
                                        <p className="text-gray-700 font-medium">
                                            {getStartTimeLabel(job.startTime)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-[#1149C7]" />
                                            Project Stage
                                        </h3>
                                        <p className="text-gray-700 font-medium">
                                            {getJobStageLabel(job.jobStage)}
                                        </p>
                                    </div>
                                </div>

                                {/* Media */}
                                {job.media && job.media.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {job.media.map((item, index) => (
                                                <div key={index} className="relative group">
                                                    {item.type === "IMAGE" ? (
                                                        <img
                                                            src={item.url}
                                                            alt={`Job media ${index + 1}`}
                                                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={item.url}
                                                            controls
                                                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "leads" && (
                            <div className="space-y-4">
                                {leads && leads.length > 0 ? (
                                    leads.map((lead) => (
                                        <div
                                            key={lead._id}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                                        >
                                            {/* Tradesperson Header */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-[#1149C7] flex items-center justify-center text-white font-bold text-lg">
                                                    {lead.tradesperson?.user?.name?.charAt(0).toUpperCase() || "T"}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {lead.tradesperson?.user?.name || "Anonymous Tradesperson"}
                                                    </h3>
                                                    <p className="text-gray-600 flex items-center gap-1">
                                                        <BuildingOfficeIcon className="w-4 h-4" />
                                                        {lead.tradesperson?.companyName || "No company info"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Received</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatDate(lead.createdAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatTime(lead.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className="mb-4 bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    Message
                                                </p>
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    {lead.message || "No message provided"}
                                                </p>
                                            </div>

                                            {/* Price Estimate */}
                                            {lead.priceEstimate && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                                        Price Estimate
                                                    </p>
                                                    <p className="text-2xl font-bold text-[#1149C7]">
                                                        £{lead.priceEstimate.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Contact Info (if unlocked) */}
                                            {lead.isUnlocked && (
                                                <div className="border-t border-gray-200 pt-4 mt-4">
                                                    <p className="text-sm font-semibold text-gray-700 mb-3">
                                                        Contact Information
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                                            <a
                                                                href={`mailto:${lead.tradesperson?.user?.email}`}
                                                                className="hover:text-[#1149C7] transition"
                                                            >
                                                                {lead.tradesperson?.user?.email}
                                                            </a>
                                                        </div>
                                                        {lead.tradesperson?.user?.phone && (
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                                                <a
                                                                    href={`tel:${lead.tradesperson?.user?.phone}`}
                                                                    className="hover:text-[#1149C7] transition"
                                                                >
                                                                    {lead.tradesperson?.user?.phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unlocked Badge */}
                                            {lead.isUnlocked && (
                                                <div className="mt-4">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        Contact Details Unlocked
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            No Leads Yet
                                        </h3>
                                        <p className="text-gray-600">
                                            Tradespeople will send you quotes for this job soon.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6 sticky top-6">
                            {/* Location */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5 text-[#1149C7]" />
                                    Location
                                </h3>
                                <p className="text-gray-700 font-medium mb-1">
                                    {job.location?.postcode || "N/A"}
                                </p>
                                {job.location?.city && (
                                    <p className="text-gray-600 text-sm">{job.location.city}</p>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-[#1149C7]" />
                                    Your Contact Info
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="text-gray-900 font-medium">{job.contactName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="text-gray-900 font-medium">{job.contactPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium break-all">
                                            {job.contactEmail}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gradient-to-br from-[#1149C7] to-[#0d38a0] rounded-lg shadow-sm p-6 text-white">
                                <h3 className="font-semibold mb-4">Lead Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/80">Total Leads</span>
                                        <span className="text-2xl font-bold">{summary.totalLeads}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/80">Status</span>
                                        <span className="font-semibold capitalize">{job.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}