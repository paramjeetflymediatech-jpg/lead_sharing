"use client";

import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyPoundIcon,
    CheckCircleIcon,
    XCircleIcon,
    BriefcaseIcon
} from "@heroicons/react/24/outline";

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/admin/jobs");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.homeowner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.homeowner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "bg-green-100 text-green-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "COMPLETED": return "bg-gray-100 text-gray-800";
            case "CANCELLED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Jobs Management</h1>
                    <p className="text-zinc-500 text-sm">Monitor and manage all job postings</p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-600 shadow-sm">
                    <BriefcaseIcon className="w-4 h-4 text-blue-500" />
                    <span>Total Jobs: {jobs.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search details, locations, or homeowner..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                        className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No jobs found matching filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Job Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Homeowner</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-medium text-zinc-900 line-clamp-1" title={job.description}>
                                                {job.description}
                                            </div>
                                            <div className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-700">{job.category?.name}</div>
                                            <div className="text-zinc-500 text-xs">{job.subCategory?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{job.homeowner?.name || "Unknown"}</div>
                                            <div className="text-zinc-500 text-xs">{job.homeowner?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-zinc-600">
                                                <MapPinIcon className="w-4 h-4 text-zinc-400" />
                                                {job.location?.city || job.location?.postcode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-zinc-900 font-medium">
                                                <CurrencyPoundIcon className="w-4 h-4 text-zinc-400" />
                                                {job.budgetMin} - {job.budgetMax}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
