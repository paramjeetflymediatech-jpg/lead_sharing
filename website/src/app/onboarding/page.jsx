"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    CheckCircle,
    Smartphone,
    FileText,
    CreditCard,
    Clock,
    UploadCloud,
    ArrowRight,
    Camera,
    XCircle,
    AlertCircle
} from "lucide-react";

const STEPS = [
    { id: "verify", title: "Verify Phone", icon: Smartphone },
    { id: "docs", title: "Documents", icon: FileText },
    { id: "bank", title: "Payout Setup", icon: CreditCard },
    { id: "pending", title: "Admin Review", icon: Clock },
];

function OnboardingContent() {
    console.log("[Onboarding] Component Rendering (SSR check)");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);

    // Form States
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Docs State
    const [docs, setDocs] = useState({
        id: null,
        license: null,
        insurance: null
    });

    useEffect(() => {
        console.log(`[Onboarding] EFFECT: user=${!!user}, step=${searchParams.get("step")}`);
        if (user) {
            fetchProfile();
            const step = searchParams.get("step");
            if (step === "bank") setCurrentStep(2);
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

                // Logic to determine current step if not explicitly in URL
                const urlStep = searchParams.get("step");
                if (urlStep) {
                    if (urlStep === "bank") setCurrentStep(2);
                    else if (urlStep === "pending") setCurrentStep(3);
                } else {
                    if (profileData.verificationStatus === "REJECTED") {
                        setCurrentStep(3);
                        setRejectionReason(profileData.rejectionReason || "Please verify your documents and try again.");
                    } else if (profileData.verificationStatus === "PENDING_APPROVAL" || profileData.verificationStatus === "APPROVED") {
                        setCurrentStep(3);
                    } else if (profileData.payoutsEnabled) {
                        setCurrentStep(3);
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
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id
                },
                body: JSON.stringify({ phone })
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

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setDocs(prev => ({ ...prev, [type]: data.url }));
                toast.success(`${type.toUpperCase()} uploaded`);

                // Save document path immediately to DB
                await fetch("/api/tradesperson/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        [`${type}Document`]: data.url
                    })
                });
            }
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const submitDocs = async () => {
        // ID and Insurance are usually mandatory for tradespersons in Canada
        if (!docs.id && !profile?.idDocument) return toast.error("Please upload your Government ID");
        if (!docs.insurance && !profile?.insuranceDocument) return toast.error("Please upload your Insurance Certificate");

        setLoading(true);
        try {
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    verificationStatus: "IN_PROGRESS"
                })
            });
            if (res.ok) {
                toast.success("Documents submitted");
                setCurrentStep(2);
            }
        } catch (err) {
            toast.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const startBankSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tradesperson/payout-setup", { method: "POST" });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || "Failed to start payout setup");
            }
        } catch (err) {
            toast.error("Failed to start payment setup");
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
                setCurrentStep(3);
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
                <div className="mb-8 md:mb-10 text-center">
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
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-5 py-3.5 md:py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#1149C7] outline-none text-base md:text-lg font-medium"
                                                    placeholder="+1 234 567 890"
                                                />
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
                                    <p className="text-sm md:text-base text-gray-500 text-center md:text-left">Please provide clear photos or scans of your credentials.</p>
                                </div>

                                <div className="grid gap-4 md:gap-6">
                                    {[
                                        { id: 'id', title: 'Government ID', subtitle: 'Driving License or Passport', field: 'idDocument' },
                                        { id: 'insurance', title: 'Insurance Certificate', subtitle: 'Liability Insurance', field: 'insuranceDocument' },
                                        { id: 'license', title: 'Trade License', subtitle: 'Optional (e.g. Master Electrician)', field: 'licenseDocument' },
                                    ].map((docType) => {
                                        const isUploaded = !!docs[docType.id] || !!profile?.[docType.field];
                                        return (
                                            <div key={docType.id} className="relative group">
                                                <input
                                                    type="file"
                                                    id={docType.id}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, docType.id)}
                                                    accept="image/*,.pdf"
                                                />
                                                <label
                                                    htmlFor={docType.id}
                                                    className={`flex items-center gap-4 md:gap-5 p-4 md:p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isUploaded ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100 hover:border-blue-300 hover:bg-blue-50/30"
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 ${isUploaded ? "bg-green-100 text-green-600" : "bg-white text-gray-400"
                                                        }`}>
                                                        {isUploaded ? <CheckCircle size={24} className="md:w-[28px] md:h-[28px]" /> : <UploadCloud size={24} className="md:w-[28px] md:h-[28px]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{docType.title} {(docType.id === 'id' || docType.id === 'insurance') && <span className="text-red-500">*</span>}</h3>
                                                        <p className="text-[10px] md:text-sm text-gray-500 truncate">{docType.subtitle}</p>
                                                    </div>
                                                    {isUploaded && (
                                                        <div className="text-[8px] md:text-xs font-bold text-green-600 bg-green-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-tighter shrink-0">
                                                            Done
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={submitDocs}
                                    disabled={loading || !(docs.id || profile?.idDocument) || !(docs.insurance || profile?.insuranceDocument)}
                                    className="w-full py-3.5 md:py-4 bg-[#1149C7] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Bank Setup */}
                        {currentStep === 2 && (
                            <div className="space-y-6 md:space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-100 text-[#1149C7] rounded-full flex items-center justify-center mx-auto">
                                    <CreditCard size={32} className="md:w-10 md:h-10" />
                                </div>
                                <div className="max-w-md mx-auto">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">Payout Method</h2>
                                    <p className="text-sm md:text-base text-gray-500 text-center leading-relaxed">Link your bank account via Stripe to receive payments securely from AllCarePros customers.</p>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-4 md:p-6 text-left max-w-sm mx-auto">
                                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                                        <CheckCircle size={16} /> Secure & Fast
                                    </h4>
                                    <p className="text-[11px] md:text-sm text-blue-800 leading-relaxed">
                                        We use Stripe Connect (trusted by millions) to handle your financial data.
                                        AllCarePros never stores your card or bank details.
                                    </p>
                                </div>

                                <div className="space-y-4 max-w-sm mx-auto">
                                    <button
                                        onClick={startBankSetup}
                                        disabled={loading}
                                        className="w-full py-3.5 md:py-4 bg-black hover:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 transition-all text-sm md:text-base"
                                    >
                                        Set up Payouts with <b>Stripe</b>
                                    </button>

                                    <button
                                        onClick={submitForApproval}
                                        className="w-full py-2 text-[#1149C7] text-xs md:text-sm font-bold hover:underline"
                                    >
                                        Skip for now and submit for review
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Pending Approval / Rejected */}
                        {currentStep === 3 && (
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
                                                        "{rejectionReason}"
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
                                            <br />
                                            <button
                                                onClick={() => router.push("/tradesperson")}
                                                className="w-full md:w-auto px-8 py-2 text-gray-400 font-bold hover:text-gray-600 transition-all text-sm"
                                            >
                                                Return to Dashboard
                                            </button>
                                        </div>
                                    </>
                                ) : (
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
                                            <button
                                                onClick={() => router.push("/tradesperson")}
                                                className="w-full md:w-auto px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm md:text-base"
                                            >
                                                Return to Dashboard
                                            </button>
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
