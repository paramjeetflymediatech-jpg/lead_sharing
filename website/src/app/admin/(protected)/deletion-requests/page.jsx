"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    Check,
    X,
    Trash2,
    Clock,
    User,
    AlertTriangle
} from "lucide-react";

export default function AdminDeletionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/deletion-requests");
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests.filter(r => r.status === 'PENDING'));
            }
        } catch (error) {
            toast.error("Failed to fetch deletion requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        if (status === 'REJECTED' && !adminNotes) {
            return toast.error("Please provide a reason for rejection in admin notes");
        }

        if (status === 'APPROVED' && !confirm("Are you sure you want to APPROVE this deletion request? This will mark the account for permanent deletion.")) {
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/deletion-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, adminNotes })
            });

            if (res.ok) {
                toast.success(`Request ${status.toLowerCase()} successfully`);
                setSelectedRequest(null);
                setAdminNotes("");
                fetchRequests();
            } else {
                const data = await res.json();
                toast.error(data.message || "Process failed");
            }
        } catch (error) {
            toast.error("Process failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 pb-6 md:pb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Trash2 className="text-red-600 w-8 h-8 md:w-10 md:h-10" />
                        Deletion Requests
                    </h1>
                    <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Review and process user account deletion requests.</p>
                </div>
                <div className="self-start md:self-center bg-red-50 text-red-700 px-4 py-2 rounded-2xl text-[10px] md:text-xs font-black border border-red-100 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} /> {requests.length} Pending Requests
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 ${selectedRequest ? 'items-start' : ''}`}>
                {/* List of Requests */}
                <div className={`lg:col-span-1 space-y-4 ${selectedRequest ? 'hidden lg:block' : 'block'}`}>
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 px-2">Pending List</h3>
                    {requests.length === 0 && !loading ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">All clear</p>
                            <p className="text-gray-500 mt-2 text-sm">No pending deletion requests</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <button
                                key={req._id}
                                onClick={() => setSelectedRequest(req)}
                                className={`w-full text-left p-5 md:p-6 rounded-[2rem] transition-all border group ${selectedRequest?._id === req._id
                                    ? "bg-red-600 text-white shadow-xl shadow-red-500/30 border-red-600"
                                    : "bg-white text-gray-900 border-gray-100 shadow-sm hover:border-red-200 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${selectedRequest?._id === req._id ? "bg-white/20" : "bg-red-50 text-red-600"
                                        }`}>
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-black truncate text-sm md:text-base">{req.name || req.user?.name || "Unknown User"}</h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${selectedRequest?._id === req._id ? "text-red-100" : "text-gray-400"
                                            }`}>
                                            {req.user ? `${req.user.role} • Linked` : "Public Request"} • {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Details Section */}
                <div className={`lg:col-span-2 ${selectedRequest ? 'block' : 'hidden lg:block'}`}>
                    {selectedRequest ? (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
                            {/* Mobile Navigation Back */}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="lg:hidden m-6 mb-2 flex items-center gap-2 text-zinc-400 font-bold text-sm uppercase tracking-widest"
                            >
                                <X size={20} /> Back to List
                            </button>

                            <div className="p-6 md:p-10 lg:p-14 space-y-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                            Request ID: {selectedRequest._id}
                                        </span>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${selectedRequest.user ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                                            {selectedRequest.user ? "Linked Account" : "Public Request"}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                            <Clock size={14} /> Submitted on {new Date(selectedRequest.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                        {selectedRequest.name || selectedRequest.user?.name}
                                    </h2>
                                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                                        {selectedRequest.email || selectedRequest.user?.email} {selectedRequest.phone ? `• ${selectedRequest.phone}` : ""}
                                    </p>
                                    {selectedRequest.user && (
                                        <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest bg-blue-50 px-3 py-1 rounded-lg w-fit">
                                            Role: {selectedRequest.user.role} (ID: {selectedRequest.user._id})
                                        </p>
                                    )}
                                </div>

                                <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 space-y-4">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <AlertTriangle size={24} />
                                        <h3 className="font-black text-lg uppercase tracking-tight">Reason for Deletion</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed font-medium bg-white/50 p-6 rounded-2xl border border-white/80 italic">
                                        "{selectedRequest.reason || 'No reason provided.'}"
                                    </p>
                                </div>

                                {/* Action Controls */}
                                <div className="space-y-6 pt-6 border-t border-gray-50">
                                    <div className="space-y-3">
                                        <label className="font-black text-[10px] uppercase tracking-widest text-gray-400 ml-2">Admin Notes / Rejection Reason</label>
                                        <textarea
                                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-300 min-h-[120px]"
                                            placeholder="Enter notes for this request or the reason for rejection..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button
                                            disabled={processing}
                                            onClick={() => handleAction(selectedRequest._id, 'APPROVED')}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 transition-all uppercase text-xs tracking-widest"
                                        >
                                            <Trash2 size={20} /> Approve Deletion
                                        </button>
                                        <button
                                            disabled={processing}
                                            onClick={() => handleAction(selectedRequest._id, 'REJECTED')}
                                            className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-200 text-gray-600 hover:text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest"
                                        >
                                            <X size={20} /> Reject Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3.5rem] h-[60vh] lg:h-[70vh] flex flex-col items-center justify-center text-center p-10 group">
                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Trash2 size={48} />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-3">Select a Request</h3>
                            <p className="text-gray-400 max-w-xs leading-relaxed font-bold text-sm">Choose a deletion request from the left to view details and process it.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
