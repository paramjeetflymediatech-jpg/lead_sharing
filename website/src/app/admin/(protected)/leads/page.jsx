"use client";

import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyPoundIcon,
    CheckBadgeIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import Pagination from "../../../../components/Pagination";

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchLeads();
    }, []);

    // Reset pagination when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/admin/leads");
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            (lead.message?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (lead.tradesperson?.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (lead.tradesperson?.user?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (lead.job?.location?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        // Example filter: Unlocked vs Locked (though admin sees all)
        const matchesFilter = filter === "ALL" || (filter === "UNLOCKED" && lead.isUnlocked);

        return matchesSearch && matchesFilter;
    });

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Leads Management</h1>
                    <p className="text-zinc-500 text-sm">Track job leads and tradesperson interactions</p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-600 shadow-sm">
                    <UserGroupIcon className="w-4 h-4 text-purple-500" />
                    <span>Total Leads: {leads.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search leads, tradespeople, or job details..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                        className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Leads</option>
                        <option value="UNLOCKED">Unlocked Only</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No leads found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Job Details</th>
                                    <th className="px-6 py-4">Tradesperson</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {currentLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs">
                                            {lead.job ? (
                                                <>
                                                    <div className="font-medium text-zinc-900 line-clamp-1">{lead.job.description}</div>
                                                    <div className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        {lead.job.location?.city} • {lead.job.category?.name}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-red-500 text-xs italic">Job Deleted</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-700">{lead.tradesperson?.companyName || "Unknown Co."}</div>
                                            <div className="text-zinc-500 text-xs">{lead.tradesperson?.user?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-zinc-600 truncate" title={lead.message}>
                                                {lead.message}
                                            </div>
                                            {lead.priceEstimate && (
                                                <div className="text-xs font-bold text-green-600 mt-1">
                                                    Est: £{lead.priceEstimate}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.isUnlocked ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckBadgeIcon className="w-3 h-3 mr-1" />
                                                    Unlocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Locked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {new Date(lead.createdAt).toLocaleDateString()} <br />
                                            {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-zinc-200">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-zinc-200">No leads found.</div>
                ) : (
                    currentLeads.map((lead) => (
                        <div key={lead._id} className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    {lead.job ? (
                                        <div className="font-bold text-zinc-900 line-clamp-1">{lead.job.description}</div>
                                    ) : (
                                        <span className="text-red-500 text-xs italic">Job Deleted</span>
                                    )}
                                    <div className="text-zinc-500 text-xs mt-0.5">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {lead.isUnlocked ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                                        Unlocked
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
                                        Locked
                                    </span>
                                )}
                            </div>

                            <div className="text-sm text-zinc-600 flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Tradesperson:</span>
                                    <span className="font-medium text-right">{lead.tradesperson?.companyName || "Unknown Co."}</span>
                                </div>
                                <div className="flex justify-between flex-wrap gap-1">
                                    <span className="text-zinc-400">Message:</span>
                                    <div className="text-right text-xs bg-zinc-50 p-1 rounded max-w-full break-words">
                                        {lead.message}
                                    </div>
                                </div>
                                {lead.priceEstimate && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Estimate:</span>
                                        <span className="font-bold text-green-600">£{lead.priceEstimate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={filteredLeads.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
