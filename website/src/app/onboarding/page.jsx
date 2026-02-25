"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    CheckCircle,
    Smartphone,
    FileText,
    Clock,
    UploadCloud,
    ArrowRight,
    Camera,
    XCircle,
    AlertCircle,
    LogOut
} from "lucide-react";

const STEPS = [
    { id: "verify", title: "Verify Phone", icon: Smartphone },
    { id: "docs", title: "Documents", icon: FileText },
    { id: "pending", title: "Admin Review", icon: Clock },
];

function OnboardingContent() {
    console.log("[Onboarding] Component Rendering (SSR check)");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);

    // Form States
    const [countryCode, setCountryCode] = useState("+1");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const countries = [
        { name: "CA/US", code: "+1" },
        { name: "UK", code: "+44" },
        { name: "AU", code: "+61" },
        { name: "IN", code: "+91" },
        
    ];

    // Docs State — these hold URLs (from DB) or local preview URLs
    const [docs, setDocs] = useState({
        id: null,
        license: null,
        insurance: null
    });

    // Pending local files — held in memory until "Save & Continue" is clicked
    const [pendingFiles, setPendingFiles] = useState({
        id: null,
        license: null,
        insurance: null
    });

    useEffect(() => {
        console.log(`[Onboarding] EFFECT: user=${!!user}, step=${searchParams.get("step")}`);
        if (user) {
            fetchProfile();
        }
    }, [user, searchParams]);

    async function fetchProfile() {
        console.log("[Onboarding] fetchProfile() called");
        try {
            const res = await fetch("/api/tradesperson/profile");
            const data = await res.json();
            if (data.success) {
                const profileData = data.data;
                setProfile(profileData);
                setPhone(profileData.phone || "");
                setDocs({
                    id: profileData.idDocument || null,
                    license: profileData.licenseDocument || null,
                    insurance: profileData.insuranceDocument || null
                });

                // Logic to determine current step if not explicitly in URL
                const urlStep = searchParams.get("step");
                if (urlStep) {
                    if (urlStep === "pending") setCurrentStep(2);
                } else {
                    if (profileData.verificationStatus === "REJECTED") {
                        setCurrentStep(2);
                        setRejectionReason(profileData.rejectionReason || "Please verify your documents and try again.");
                    } else if (profileData.verificationStatus === "PENDING_APPROVAL" || profileData.verificationStatus === "APPROVED") {
                        setCurrentStep(2);
                    } else if (profileData.idDocument && profileData.insuranceDocument) {
                        setCurrentStep(2);
                    } else if (profileData.phoneVerified) {
                        setCurrentStep(1);
                        setIsPhoneVerified(true);
                    }
                }
            }
        } catch (error) {
            console.error("Fetch profile error", error);
        }
    }

    const sendOtp = async () => {
        setLoading(true);
        const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone}`;
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id
                },
                body: JSON.stringify({ phone: fullPhone })
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
                toast.success("OTP sent to your phone");
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id
                },
                body: JSON.stringify({ otp })
            });
            const data = await res.json();
            if (data.success) {
                setIsPhoneVerified(true);
                toast.success("Phone verified!");

                // Update global auth state
                if (refreshUser) await refreshUser();

                // Transition to next step after a short delay
                setTimeout(() => {
                    setCurrentStep(1);
                }, 1000);
            } else {
                toast.error(data.error || "Invalid OTP");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ Allowed file types
        const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
        const allowedDocTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        const isImage = allowedImageTypes.includes(file.type);
        const isDoc = allowedDocTypes.includes(file.type);

        if (!isImage && !isDoc) {
            toast.error("Format not supported. Please upload an image (JPG, PNG) or document (PDF, Word).");
            return;
        }

        // ✅ Dynamic size limits
        const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`File too large. Max limit is ${maxSize / (1024 * 1024)}MB.`);
            return;
        }

        // ✅ Store file locally — NO server upload yet
        // Create a local preview URL just to show "selected" state
        const localPreviewUrl = URL.createObjectURL(file);
        setPendingFiles(prev => ({ ...prev, [type]: file }));
        // Use a special marker to indicate local selection (not yet saved to DB)
        setDocs(prev => ({ ...prev, [type]: localPreviewUrl }));
        toast.success(`${type.replace('id', 'ID').replace('license', 'License').replace('insurance', 'Insurance')} selected — click Save & Continue to upload`);
    };

    const submitDocs = async () => {
        // Check: must have either a pending local file OR an already-saved DB URL
        const hasId = pendingFiles.id || profile?.idDocument;
        const hasInsurance = pendingFiles.insurance || profile?.insuranceDocument;

        if (!hasId) return toast.error("Please upload your Government ID");
        if (!hasInsurance) return toast.error("Please upload your Insurance Certificate");

        setLoading(true);
        try {
            // ✅ Step 1: Upload any pending local files to the server NOW
            const uploadFile = async (file) => {
                if (!file) return null;
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (!res.ok || !data.url) throw new Error("Upload failed for " + file.name);
                return data.url;
            };

            const idUrl = pendingFiles.id
                ? await uploadFile(pendingFiles.id)
                : profile?.idDocument || null;

            const insuranceUrl = pendingFiles.insurance
                ? await uploadFile(pendingFiles.insurance)
                : profile?.insuranceDocument || null;

            const licenseUrl = pendingFiles.license
                ? await uploadFile(pendingFiles.license)
                : profile?.licenseDocument || null;

            // ✅ Step 2: Save to database
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    verificationStatus: "PENDING_APPROVAL",
                    idDocument: idUrl,
                    insuranceDocument: insuranceUrl,
                    licenseDocument: licenseUrl
                })
            });
            if (res.ok) {
                toast.success("Documents submitted successfully!");
                setPendingFiles({ id: null, license: null, insurance: null });
                setCurrentStep(2);
                if (refreshUser) await refreshUser();
            } else {
                toast.error("Submission failed. Please try again.");
            }
        } catch (err) {
            console.error("submitDocs error:", err);
            toast.error(err.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };


    const submitForApproval = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verificationStatus: "PENDING_APPROVAL" })
            });
            if (res.ok) {
                setCurrentStep(2);
                setRejectionReason(""); // Clear any previous rejection
                toast.success("Application submitted for approval");
            }
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const reSubmit = async () => {
        setLoading(true);
        try {
            // Reset status to NOT_STARTED to allow re-submission UI but keep documents
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verificationStatus: "NOT_STARTED" })
            });
            if (res.ok) {
                setCurrentStep(1);
                setRejectionReason("");
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 md:py-12 px-4">
            <div className="max-w-3xl w-full">
                {/* Header */}
                <div className="mb-8 md:mb-10 flex flex-col items-center relative">
                    {/* Logout Button (Small, Top Right relative to container) */}
                    <div className="absolute -top-4 -right-2 md:right-0">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors py-2 px-3 rounded-xl hover:bg-red-50 text-xs font-bold uppercase tracking-wider"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Tradesperson Onboarding</h1>
                    <p className="text-sm md:text-base text-gray-500">Complete these steps to start applying for jobs</p>
                </div>

                {/* Progress Tracker */}
                <div className="flex justify-between mb-10 md:mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === idx;
                        const isCompleted = currentStep > idx;
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center w-1/4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-[#1149C7] text-white" :
                                    isActive ? "bg-[#1149C7] text-white ring-4 ring-blue-100" :
                                        "bg-white text-gray-400 border-2 border-gray-200"
                                    }`}>
                                    {isCompleted ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-5 h-5 md:w-5 md:h-5" />}
                                </div>
                                <span className={`mt-3 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center px-1 ${isActive ? "text-[#1149C7]" : "text-gray-400"
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-12">

                        {/* Step 0: Phone Verification */}
                        {currentStep === 0 && (
                            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">Verify Phone Number</h2>
                                    <p className="text-sm md:text-base text-gray-500 text-center md:text-left">We'll send you a 6-digit code to confirm your contact details.</p>
                                </div>

                                <div className="space-y-4">
                                    {!otpSent ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={countryCode}
                                                        onChange={(e) => setCountryCode(e.target.value)}
                                                        className="w-24 md:w-32 px-2 py-3.5 md:py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#1149C7] outline-none text-sm md:text-base font-medium"
                                                    >
                                                        {countries.map(c => (
                                                            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="flex-1 px-5 py-3.5 md:py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#1149C7] outline-none text-base md:text-lg font-medium"
                                                        placeholder="234 567 890"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={sendOtp}
                                                disabled={loading || !phone}
                                                className="w-full py-3.5 md:py-4 bg-[#1149C7] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                                            >
                                                {loading ? "Sending..." : "Send Verification Code"}
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Enter 6-digit Code</label>
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full px-5 py-3.5 md:py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#1149C7] outline-none text-center text-xl md:text-2xl font-black tracking-[0.5em] md:tracking-[1em]"
                                                    placeholder="000000"
                                                />
                                            </div>
                                            <button
                                                onClick={verifyOtp}
                                                disabled={loading || otp.length < 6}
                                                className="w-full py-3.5 md:py-4 bg-[#1149C7] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                                            >
                                                {loading ? "Verifying..." : "Confirm & Continue"}
                                            </button>
                                            <button
                                                onClick={() => setOtpSent(false)}
                                                className="w-full py-2 text-gray-400 text-sm font-bold hover:text-gray-600 transition-all"
                                            >
                                                Use a different number
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Document Upload */}
                        {currentStep === 1 && (
                            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">Upload Documents</h2>
                                    <p className="text-sm md:text-base text-gray-500 text-center md:text-left">Please provide clear photos or documents (Images & PDF/Docs accepted).</p>
                                </div>

                                <div className="grid gap-4 md:gap-6">
                                    {[
                                        { id: 'id', title: 'Government ID', subtitle: 'Image or PDF (License/Passport)', field: 'idDocument' },
                                        { id: 'insurance', title: 'Insurance Certificate', subtitle: 'Image or PDF (Liability)', field: 'insuranceDocument' },
                                        { id: 'license', title: 'Trade License', subtitle: 'Image or PDF (Optional)', field: 'licenseDocument' },
                                    ].map((docType) => {
                                        const isPending = !!pendingFiles[docType.id]; // locally selected, not saved
                                        const isSaved = !isPending && !!profile?.[docType.field]; // already in DB
                                        const isAnySelected = isPending || isSaved;
                                        return (
                                            <div key={docType.id} className="relative group">
                                                <input
                                                    type="file"
                                                    id={docType.id}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, docType.id)}
                                                    accept="image/*,.pdf,.doc,.docx"
                                                />
                                                <label
                                                    htmlFor={docType.id}
                                                    className={`flex items-center gap-4 md:gap-5 p-4 md:p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isSaved ? "bg-green-50 border-green-200" :
                                                            isPending ? "bg-amber-50 border-amber-300" :
                                                                "bg-gray-50 border-gray-100 hover:border-blue-300 hover:bg-blue-50/30"
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 ${isSaved ? "bg-green-100 text-green-600" :
                                                            isPending ? "bg-amber-100 text-amber-600" :
                                                                "bg-white text-gray-400"
                                                        }`}>
                                                        {isSaved ? <CheckCircle size={24} className="md:w-[28px] md:h-[28px]" /> :
                                                            isPending ? <CheckCircle size={24} className="md:w-[28px] md:h-[28px]" /> :
                                                                <UploadCloud size={24} className="md:w-[28px] md:h-[28px]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{docType.title} {(docType.id === 'id' || docType.id === 'insurance') && <span className="text-red-500">*</span>}</h3>
                                                        <p className="text-[10px] md:text-sm text-gray-500 truncate">
                                                            {isPending ? `${pendingFiles[docType.id].name} — ready to upload` : docType.subtitle}
                                                        </p>
                                                    </div>
                                                    {isSaved && (
                                                        <div className="text-[8px] md:text-xs font-bold text-green-600 bg-green-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-tighter shrink-0">
                                                            Saved ✓
                                                        </div>
                                                    )}
                                                    {isPending && (
                                                        <div className="text-[8px] md:text-xs font-bold text-amber-700 bg-amber-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-tighter shrink-0">
                                                            Ready
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={submitDocs}
                                        disabled={loading || !(pendingFiles.id || profile?.idDocument) || !(pendingFiles.insurance || profile?.insuranceDocument)}
                                        className="flex-1 py-3.5 md:py-4 bg-[#1149C7] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Uploading & Saving..." : "Save & Continue"}
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(0)}
                                        className="md:w-1/3 py-3.5 md:py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pending Approval / Rejected / Approved */}
                        {currentStep === 2 && (
                            <div className="space-y-6 md:space-y-8 text-center animate-in zoom-in duration-500 px-2">
                                {profile?.verificationStatus === "REJECTED" ? (
                                    <>
                                        <div className="w-16 h-16 md:w-24 md:h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                            <XCircle size={32} className="md:w-10 md:h-10" />
                                        </div>
                                        <div className="max-w-md mx-auto">
                                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 text-red-600">Verification Rejected</h2>
                                            <p className="text-base md:text-lg text-gray-500">Unfortunately, your account verification could not be completed.</p>
                                        </div>

                                        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 md:p-8 text-left max-w-lg mx-auto">
                                            <div className="flex gap-4">
                                                <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                                <div>
                                                    <h4 className="font-bold text-red-900 text-sm md:text-base mb-1">Reason for Rejection:</h4>
                                                    <p className="text-sm md:text-base text-red-800 leading-relaxed italic">
                                                        "{rejectionReason || profile?.rejectionReason || "Please check your documents and try again."}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 md:pt-6 space-y-4">
                                            <button
                                                onClick={reSubmit}
                                                disabled={loading}
                                                className="w-full md:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all text-sm md:text-base"
                                            >
                                                {loading ? "Please wait..." : "Fix & Re-submit Documents"}
                                            </button>
                                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                                <button
                                                    onClick={() => router.push("/tradesperson")}
                                                    className="w-full md:w-auto px-12 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm"
                                                >
                                                    Return to Dashboard
                                                </button>
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="w-full md:w-auto px-12 py-3.5 bg-white border border-gray-200 text-gray-400 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : profile?.verificationStatus === "APPROVED" ? (
                                    <>
                                        <div className="w-16 h-16 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle size={32} className="md:w-10 md:h-10" />
                                        </div>
                                        <div className="max-w-md mx-auto">
                                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Verification Successful</h2>
                                            <p className="text-base md:text-lg text-gray-600">Congratulations! Your account has been verified and you're ready to start working.</p>
                                        </div>

                                        <div className="bg-green-50 border border-green-100 rounded-3xl p-6 md:p-8 max-w-lg mx-auto">
                                            <p className="text-sm md:text-base text-green-800 font-bold">
                                                Your profile is now live and visible to potential customers.
                                            </p>
                                        </div>

                                        <div className="pt-4 md:pt-6 flex flex-col md:flex-row gap-4 justify-center">
                                            <button
                                                onClick={() => router.push("/tradesperson")}
                                                className="w-full md:w-auto px-12 py-4 bg-[#1149C7] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all text-base tracking-wide"
                                            >
                                                Return to Dashboard
                                            </button>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="w-full md:w-auto px-12 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </>
                                ) : ( // PENDING_APPROVAL or other statuses default to Under Review
                                    <>
                                        <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                                            <Clock size={32} className="md:w-10 md:h-10" />
                                        </div>
                                        <div className="max-w-md mx-auto">
                                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Under Review</h2>
                                            <p className="text-base md:text-lg text-gray-500">Your application has been received and is being verified by our team.</p>
                                        </div>

                                        <div className="space-y-3 md:space-y-4 max-w-sm mx-auto">
                                            <div className="flex items-center gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-left">
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs md:text-sm text-gray-900">Identity & Credentials</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400">Verifying documents</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-left">
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs md:text-sm text-gray-900">Skills & Experience</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400">Checking profile details</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 md:pt-6">
                                            <p className="text-xs md:text-sm text-gray-400 mb-6 italic px-4">This usually takes 24-48 business hours. We'll email you once you're approved!</p>
                                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                                <button
                                                    onClick={() => router.push("/tradesperson")}
                                                    className="w-full md:w-auto px-12 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm"
                                                >
                                                    Return to Dashboard
                                                </button>
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="w-full md:w-auto px-12 py-3.5 bg-white border border-gray-200 text-gray-400 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <p className="mt-8 text-center text-[10px] md:text-xs text-gray-400 tracking-wider font-medium opacity-60 uppercase">
                    &copy; 2026 ALLCAREPROS &bull; SECURE ONBOARDING SYSTEM
                </p>
            </div>
        </div>
    );
}

export default function TradespersonOnboarding() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Loading Onboarding...</p>
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
