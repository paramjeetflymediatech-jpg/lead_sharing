"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    Check,
    X,
    Eye,
    Shield,
    ExternalLink,
    Clock,
    User
} from "lucide-react";

export default function AdminVerifications() {
    const [tradespersons, setTradespersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState("");
    const [viewerLabel, setViewerLabel] = useState("");

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await fetch("/api/admin/tradespersons?status=PENDING_APPROVAL");
            const data = await res.json();
            if (data.success) {
                setTradespersons(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (profileId, status) => {
        if (status === 'REJECTED' && !rejectionReason) {
            return toast.error("Please provide a reason for rejection");
        }

        try {
            const res = await fetch("/api/admin/tradespersons", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileId, status, rejectionReason })
            });

            if (res.ok) {
                toast.success(`Application ${status.toLowerCase()} successfully`);
                setSelectedProfile(null);
                setRejectionReason("");
                fetchPending();
            }
        } catch (error) {
            toast.error("Process failed");
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 pb-6 md:pb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Shield className="text-blue-600 w-8 h-8 md:w-10 md:h-10" />
                        Verifications
                    </h1>
                    <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Manage contractor credentials and document approvals.</p>
                </div>
                <div className="self-start md:self-center bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-[10px] md:text-xs font-black border border-amber-100 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} /> {tradespersons.length} Pending Approval
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 ${selectedProfile ? 'items-start' : ''}`}>
                {/* List of Pending - Hidden on mobile if choosing a profile */}
                <div className={`lg:col-span-1 space-y-4 ${selectedProfile ? 'hidden lg:block' : 'block'}`}>
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 px-2">Pending Applications</h3>
                    {tradespersons.length === 0 && !loading ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">All caught up</p>
                            <p className="text-gray-500 mt-2 text-sm">No applications to review</p>
                        </div>
                    ) : (
                        tradespersons.map((tp) => (
                            <button
                                key={tp.id}
                                onClick={() => setSelectedProfile(tp)}
                                className={`w-full text-left p-5 md:p-6 rounded-[2rem] transition-all border group ${selectedProfile?.id === tp.id
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 border-blue-600"
                                    : "bg-white text-gray-900 border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${selectedProfile?.id === tp.id ? "bg-white/20" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-black truncate text-sm md:text-base">{tp.company_name || tp.name}</h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${selectedProfile?.id === tp.id ? "text-blue-100" : "text-gray-400"
                                            }`}>
                                            {tp.email}
                                        </p>
                                    </div>
                                    <div className={`transition-transform duration-300 ${selectedProfile?.id === tp.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 lg:group-hover:opacity-100"}`}>
                                        <Eye size={20} />
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Details Section */}
                <div className={`lg:col-span-2 ${selectedProfile ? 'block' : 'hidden lg:block'}`}>
                    {selectedProfile ? (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
                            {/* Mobile Navigation Back */}
                            <button
                                onClick={() => setSelectedProfile(null)}
                                className="lg:hidden m-6 mb-2 flex items-center gap-2 text-zinc-400 font-bold text-sm uppercase tracking-widest"
                            >
                                <X size={20} /> Back to List
                            </button>

                            <div className="p-6 md:p-10 lg:p-14 space-y-10">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 border-b border-gray-50 pb-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                Application ID: TP-{selectedProfile.id}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                <Clock size={14} /> {new Date(selectedProfile.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                            {selectedProfile.company_name}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => handleAction(selectedProfile.id, 'APPROVED')}
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-green-500/30 transition-all uppercase text-xs tracking-widest h-fit"
                                    >
                                        <Check size={20} /> Approve Profile
                                    </button>
                                </div>

                                {/* Doc Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                                    {[
                                        { id: 'id_document', label: 'Identity Proof', icon: Shield },
                                        { id: 'license_document', label: 'Trade License', icon: ExternalLink },
                                        { id: 'insurance_document', label: 'Insurance Policy', icon: Shield },
                                    ].map(doc => (
                                        <div key={doc.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center gap-4 transition-all hover:bg-white hover:shadow-lg group">
                                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-blue-50 group-hover:scale-110 transition-transform">
                                                <doc.icon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{doc.label}</p>
                                                {selectedProfile[doc.id] ? (
                                                    <button
                                                        onClick={() => {
                                                            setViewerUrl(selectedProfile[doc.id]);
                                                            setViewerLabel(doc.label);
                                                            setViewerOpen(true);
                                                        }}
                                                        className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1.5 text-sm justify-center"
                                                    >
                                                        Review <ExternalLink size={14} />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">Not Uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Profile info */}
                                <div className="space-y-8 bg-zinc-50/80 p-6 md:p-10 rounded-[2.5rem] border border-zinc-100/50">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Professional Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-12">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Primary Contact</p>
                                            <p className="text-lg font-black text-zinc-900">{selectedProfile.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Phone Verification</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedProfile.phone_verified ? "bg-green-500" : "bg-amber-500"}`} />
                                                <p className={`font-black text-sm ${selectedProfile.phone_verified ? "text-green-600" : "text-amber-600"}`}>
                                                    {selectedProfile.phone_verified ? "VERIFIED" : "PENDING"} ({selectedProfile.phone})
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Industry Experience</p>
                                            <p className="text-lg font-black text-zinc-900">{selectedProfile.experience_years} Years Professional</p>
                                        </div>
                                    </div>
                                    <div className="pt-8 mt-8 border-t border-zinc-200/60">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Company Summary</p>
                                        <div className="bg-white/60 p-5 rounded-2xl italic text-zinc-600 border border-white/80 text-sm leading-relaxed">
                                            "{selectedProfile.bio || 'The contractor has not provided a summary for their profile yet.'}"
                                        </div>
                                    </div>
                                </div>

                                {/* Rejection Panel */}
                                <div className="pt-12 border-t border-gray-100">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                <X size={18} />
                                            </div>
                                            <h3 className="font-black text-[10px] uppercase tracking-widest text-red-400">Decline Application</h3>
                                        </div>
                                        <textarea
                                            className="w-full bg-red-50/30 border border-red-100 rounded-3xl p-6 outline-none focus:ring-4 focus:ring-red-100 transition-all text-sm text-red-900 placeholder:text-red-300 min-h-[120px]"
                                            placeholder="Clearly explain the reason for declining (e.g., 'Trade License is expired' or 'Identity proof is blurry')..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleAction(selectedProfile.id, 'REJECTED')}
                                            className="w-full md:w-auto bg-white border-2 border-red-100 text-red-600 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-all uppercase text-xs tracking-widest"
                                        >
                                            Decline & Notify Contractor
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3.5rem] h-[60vh] lg:h-[70vh] flex flex-col items-center justify-center text-center p-10 group">
                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Shield size={48} />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-3">Select Application</h3>
                            <p className="text-gray-400 max-w-xs leading-relaxed font-bold text-sm">Choose a tradesperson profile from the list to begin the verification process.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {viewerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900">{viewerLabel}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reviewing Application Profile: TP-{selectedProfile?.id}</p>
                            </div>
                            <button
                                onClick={() => setViewerOpen(false)}
                                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all active:scale-90 group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 bg-zinc-50 overflow-auto p-4 md:p-8 flex items-center justify-center">
                            {viewerUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={viewerUrl}
                                    className="w-full h-full rounded-2xl border-none shadow-inner"
                                    title={viewerLabel}
                                />
                            ) : (
                                <div className="relative group w-full h-full flex items-center justify-center">
                                    <img
                                        src={viewerUrl}
                                        alt={viewerLabel}
                                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 pointer-events-none">
                                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-xl border border-white">
                                            High Resolution Preview
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Shield size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Status</p>
                                    <p className="font-bold text-sm text-gray-900">Pending Verification</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <a
                                    href={viewerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 md:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    Open Externally <ExternalLink size={14} />
                                </a>
                                <button
                                    onClick={() => setViewerOpen(false)}
                                    className="flex-1 md:flex-none px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
