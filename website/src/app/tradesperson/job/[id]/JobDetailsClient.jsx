"use client";

import { useState } from "react";
import Link from "next/link";

export default function JobDetailsClient({ job, leadCount, hasUnlocked, profile, user, lead }) {
    const [selectedImage, setSelectedImage] = useState(null);

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
                        <div
                            key={index}
                            className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
                            onClick={() => setSelectedImage(url)}
                        >
                            <img
                                src={url || "/placeholder-image.jpg"}
                                alt={`Job media ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-black/50 p-2 rounded-full">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#000000]">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
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
                                            <span className="font-semibold">City:</span> {job.city || job.location?.city || "Not specified"}
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
                                        {/* {job.budgetMin && job.budgetMax && (
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Average: ${Math.round((job.budgetMin + job.budgetMax) / 2)}
                                            </p>
                                        )} */}
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
                                        href={`/tradesperson`}
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

            {/* Full Screen Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-screen p-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full screen view"
                            className="max-h-[90vh] max-w-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
