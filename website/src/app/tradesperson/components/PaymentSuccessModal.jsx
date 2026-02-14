"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PaymentSuccessModal({ sessionId }) {
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [creditsAdded, setCreditsAdded] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (!sessionId || status !== "verifying") return;

        let isMounted = true;

        const verifyPayment = async () => {
            // 🛑 CRITICAL FIX: Prevent duplicate verification loop
            // router.refresh() causes this component to re-mount while the URL still has payment=success
            // We MUST check if we already verified this specific session to avoid an infinite loop
            if (typeof window !== 'undefined' && sessionStorage.getItem(`verified_session_${sessionId}`)) {
                console.log("Already verified this session, skipping to prevent loop...");
                setStatus("success");
                setTimeout(() => {
                    if (isMounted) {
                        router.replace("/tradesperson");
                    }
                }, 2000);
                return;
            }

            try {
                const res = await fetch("/api/payment/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await res.json();

                if (!isMounted) return;

                if (res.ok && data.success) {
                    // ✅ Mark as verified immediately to block re-entry
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(`verified_session_${sessionId}`, 'true');
                    }

                    setStatus("success");
                    setCreditsAdded(data.credits);

                    if (data.newBalance) {
                        toast.success(`Successfully added ${data.credits} credits! New Balance: ${data.newBalance}`);
                    } else {
                        toast.success(`Successfully added ${data.credits} credits!`);
                    }

                    // 🔄 Refresh server data (balance) - This causes a re-render/remount!
                    // The sessionStorage check above protects us from looping here.
                    router.refresh();

                    // Clear URL params after a delay
                    setTimeout(() => {
                        if (isMounted) {
                            router.replace("/tradesperson");
                        }
                    }, 2000);

                } else {
                    console.error("Verification failed:", data.error);
                    setStatus("error");
                    toast.error(data.error || "Payment verification failed");
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Error verifying payment:", error);
                setStatus("error");
                toast.error("Something went wrong verifying your payment");
            }
        };

        verifyPayment();

        return () => {
            isMounted = false;
        };
    }, [sessionId, router, status]);

    if (!sessionId) return null;

    return (
        <div className="h-full fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-[450px] aspect-square shadow-2xl overflow-hidden border border-white/20 relative flex flex-col items-center justify-center p-6 md:p-8 text-center animate-in zoom-in-95 duration-300 mx-auto">
                {/* Close Icon */}
                <button
                    onClick={() => router.replace("/tradesperson")}
                    className="absolute top-4 md:top-6 right-4 md:right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="mb-6 md:mb-8 relative">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 ${status === "verifying" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                        status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-600 shadow-xl shadow-green-500/20" :
                            "bg-red-100 dark:bg-red-900/30 text-red-600"
                        }`}>
                        {status === "verifying" && <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin" />}
                        {status === "success" && <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />}
                        {status === "error" && <XCircle className="w-10 h-10 md:w-12 md:h-12" />}
                    </div>
                    {status === "success" && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            <span className="text-sm md:text-xl">✨</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3 md:space-y-4 max-w-xs px-2">
                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
                        {status === "verifying" && "Verifying Payment..."}
                        {status === "success" && "Payment Successful! 🎉"}
                        {status === "error" && "Verification Failed"}
                    </h3>

                    <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg leading-relaxed">
                        {status === "verifying" && "Hang tight! We're confirming your transaction."}
                        {status === "success" && (
                            <>
                                <strong>{creditsAdded} credits</strong> have been added to your account.
                            </>
                        )}
                        {status === "error" && "We couldn't verify your payment. Please contact support."}
                    </p>
                </div>

                <div className="mt-8 md:mt-10 flex flex-col gap-2 md:gap-3 w-full max-w-xs transition-all duration-500 ease-out">
                    {status === "success" && (
                        <Link
                            href="/tradesperson/leads"
                            className="w-full py-1 md:py-2 bg-green-600 text-white font-bold rounded-xl md:rounded-2xl hover:bg-green-500 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                        >
                            View Leads
                            <span className="text-lg md:text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    )}

                    <button
                        onClick={() => router.replace("/tradesperson")}
                        className="w-full py-1 md:py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-xl md:rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center text-sm md:text-base"
                    >
                        {status === "success" ? "Close" : "Return to Dashboard"}
                    </button>
                </div>
            </div>
        </div>
    );
}
