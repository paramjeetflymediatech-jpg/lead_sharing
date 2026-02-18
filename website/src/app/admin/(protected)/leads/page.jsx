"use client";

import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckBadgeIcon,
    UserGroupIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Pagination from "../../../../components/Pagination";

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // CRUD State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
    const [formData, setFormData] = useState({
        job: "",
        tradesperson: "",
        message: "",
        priceEstimate: "",
        isUnlocked: false,
        status: "PENDING"
    });
    const [submitting, setSubmitting] = useState(false);

    // Data for selectors
    const [tradespeople, setTradespeople] = useState([]);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchLeads();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [usersRes, jobsRes] = await Promise.all([
                fetch("/api/admin/users?role=TRADESPERSON&limit=1000"),
                fetch("/api/admin/jobs")
            ]);
            if (usersRes.ok) {
                const data = await usersRes.json();
                setTradespeople(data.users || []);
            }
            if (jobsRes.ok) setJobs(await jobsRes.json());
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

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
            (lead.job?.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (lead.job?.location?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        const matchesFilter = filter === "ALL" || (filter === "UNLOCKED" && lead.isUnlocked);

        return matchesSearch && matchesFilter;
    });

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({
            job: "",
            tradesperson: "",
            message: "",
            priceEstimate: "",
            isUnlocked: false,
            status: "PENDING"
        });
        setIsFormModalOpen(true);
    };

    const openEditModal = (lead) => {
        setModalMode("edit");
        setFormData({
            _id: lead._id,
            job: lead.job?._id || lead.job || "",
            tradesperson: lead.tradesperson?.id || lead.tradesperson?._id || lead.tradesperson || "",
            message: lead.message || "",
            priceEstimate: lead.priceEstimate || "",
            isUnlocked: lead.isUnlocked || false,
            status: lead.status || "PENDING"
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = modalMode === "create" ? "POST" : "PATCH";
            const url = modalMode === "create" ? "/api/admin/leads" : `/api/admin/leads/${formData._id}`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Lead ${modalMode === "create" ? "created" : "updated"} successfully`);
                fetchLeads();
                setIsFormModalOpen(false);
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to save lead");
            }
        } catch (error) {
            console.error("Error saving lead:", error);
            toast.error("An error occurred while saving the lead");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (leadId) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        try {
            const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Lead deleted successfully");
                setLeads(leads.filter(l => l._id !== leadId));
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to delete lead");
            }
        } catch (error) {
            console.error("Error deleting lead:", error);
            toast.error("An error occurred while deleting the lead");
        }
    };

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 line-height-tight">Leads Management</h1>
                    <p className="text-zinc-500 text-sm">Track job leads and tradesperson interactions</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-600 shadow-sm">
                        <UserGroupIcon className="w-4 h-4 text-purple-500" />
                        <span>Total Leads: {leads.length}</span>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Lead</span>
                    </button>
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
                                    <th className="px-6 py-4 text-right">Actions</th>
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
                                                    Est: ${lead.priceEstimate}
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
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(lead)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit Lead"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lead._id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete Lead"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
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
                                    {/* {lead.job ? (
                                        <div className="font-bold text-sm text-zinc-900 line-clamp-1">{lead.job.description}</div>
                                    ) :
                                     (
                                        <span className="text-red-500 text-xs italic">Job Deleted</span>
                                    )} */}
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
                                        <span className="font-bold text-green-600">${lead.priceEstimate}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex justify-end gap-3">
                                <button
                                    onClick={() => openEditModal(lead)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(lead._id)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lead Form Modal (Create/Edit) */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-zinc-200 overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900">
                                    {modalMode === "create" ? "Add New Lead" : "Edit Lead"}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {modalMode === "create" ? "Assign a tradesperson to a job" : `Editing Lead ID: ${formData._id}`}
                                </p>
                            </div>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                                <XCircleIcon className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Select Job</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                        value={formData.job}
                                        onChange={e => setFormData({ ...formData, job: e.target.value })}
                                        disabled={modalMode === "edit"}
                                    >
                                        <option value="" disabled>Choose a job...</option>
                                        {jobs.map(job => (
                                            <option key={job._id} value={job._id}>
                                                {job.description?.substring(0, 50)}... ({job.location?.city})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Select Tradesperson</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                        value={formData.tradesperson}
                                        onChange={e => setFormData({ ...formData, tradesperson: e.target.value })}
                                        disabled={modalMode === "edit"}
                                    >
                                        <option value="" disabled>Choose a tradesperson...</option>
                                        {tradespeople.map(tp => (
                                            <option key={tp._id} value={tp._id}>
                                                {tp.name} ({tp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Introduction Message</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm resize-none"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Lead introduction message..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Price Estimate ($)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                            value={formData.priceEstimate}
                                            onChange={e => setFormData({ ...formData, priceEstimate: e.target.value })}
                                            placeholder="e.g. 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Status</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="HIRED">Hired</option>
                                            <option value="REJECTED">Rejected</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isUnlocked"
                                        className="w-4 h-4 text-purple-600 border-zinc-300 rounded focus:ring-purple-500"
                                        checked={formData.isUnlocked}
                                        onChange={e => setFormData({ ...formData, isUnlocked: e.target.checked })}
                                    />
                                    <label htmlFor="isUnlocked" className="text-sm font-medium text-zinc-700 cursor-pointer">
                                        Mark as Unlocked (Paid)
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-5 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {modalMode === "create" ? "Create Lead" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
