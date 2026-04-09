"use client";

import { useEffect, useState } from "react";
import {
    EnvelopeIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    XMarkIcon,
    EyeIcon,
    ChatBubbleLeftEllipsisIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function ContactRequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, statusFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, search]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter,
                search: search
            });

            const res = await fetch(`/api/admin/contact-requests?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests);
                setTotalItems(data.total);
            } else {
                toast.error("Failed to fetch contact requests");
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/contact-requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminNotes })
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(requests.map(r => r._id === id ? data.request : r));
                toast.success(`Marked as ${newStatus.toLowerCase()}`);
                closeModal();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Permanently delete this inquiry?")) return;

        try {
            const res = await fetch(`/api/admin/contact-requests/${id}`, { method: "DELETE" });
            if (res.ok) {
                setRequests(requests.filter(r => r._id !== id));
                toast.success("Deleted successfully");
            } else {
                toast.error("Delete failed");
            }
        } catch (error) {
            toast.error("Error deleting entry");
        }
    };

    const openModal = (request) => {
        setSelectedRequest(request);
        setAdminNotes(request.admin_notes || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'PROCESSED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'ARCHIVED': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-blue-600" />
                        Contact Inquiries
                    </h1>
                    <p className="text-zinc-500 mt-2 text-sm md:text-base">Review and manage customer support requests from the website.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="flex space-x-8">
                    {['ALL', 'PENDING', 'PROCESSED', 'ARCHIVED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Table View */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Sender</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Subject / Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Received</th>
                                <th className="relative px-6 py-4 font-bold uppercase text-xs text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">{req.name}</div>
                                            <div className="text-xs text-zinc-500">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-zinc-900 dark:text-zinc-200 max-w-xs truncate font-medium">{req.subject || 'No Subject'}</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">{req.category}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {formatDate(req.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal(req)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(req._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">No inquiries found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            {/* Detail Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">Inquiry Details</h2>
                                <p className="text-xs text-zinc-500 mt-1">ID: {selectedRequest._id}</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Sender Info */}
                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">From</label>
                                    <div className="font-bold text-lg dark:text-white">{selectedRequest.name}</div>
                                    <div className="text-blue-600 dark:text-blue-400 font-medium">{selectedRequest.email}</div>
                                </div>
                                <div className="text-right">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Received</label>
                                    <div className="dark:text-zinc-300 font-medium">{formatDate(selectedRequest.createdAt)}</div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <EnvelopeIcon className="w-4 h-4" /> Message
                                </label>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                                    "{selectedRequest.message}"
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="space-y-4 pt-4">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Internal Notes</label>
                                <textarea
                                    className="w-full p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    rows="4"
                                    placeholder="Add notes about this request..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={() => handleUpdateStatus(selectedRequest._id, 'PROCESSED')}
                                    disabled={updating}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Mark Processed
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedRequest._id, 'ARCHIVED')}
                                    disabled={updating}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-zinc-900/20"
                                >
                                    <ArchiveBoxIcon className="w-5 h-5" />
                                    Archive
                                </button>
                                {selectedRequest.status !== 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest._id, 'PENDING')}
                                        disabled={updating}
                                        className="sm:w-32 bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <ClockIcon className="w-5 h-5" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
