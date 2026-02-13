"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PaymentSuccessModal({ sessionId }) {
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [creditsAdded, setCreditsAdded] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (!sessionId) return;

        const verifyPayment = async () => {
            try {
                const res = await fetch("/api/payment/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus("success");
                    setCreditsAdded(data.credits);

                    if (data.newBalance) {
                        toast.success(`Successfully added ${data.credits} credits! New Balance: ${data.newBalance}`);
                    } else {
                        toast.success(`Successfully added ${data.credits} credits!`);
                    }

                    // Force a router refresh to update server components
                    router.refresh();

                    // Fallback reload if router.refresh doesn't update specific UI parts
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                } else {
                    console.error("Verification failed:", data.error);
                    setStatus("error");
                    toast.error(data.error || "Payment verification failed");
                }
            } catch (error) {
                console.error("Error verifying payment:", error);
                setStatus("error");
                toast.error("Something went wrong verifying your payment");
            }
        };

        verifyPayment();
    }, [sessionId, router]);

    if (!sessionId) return null;

    return (
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-3xl p-6 shadow-2xl shadow-green-500/30 animate-in slide-in-from-top duration-500 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        {status === "verifying" && <Loader2 className="w-8 h-8 animate-spin" />}
                        {status === "success" && <CheckCircle className="w-8 h-8" />}
                        {status === "error" && <XCircle className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">
                            {status === "verifying" && "Verifying Payment..."}
                            {status === "success" && "Payment Successful! 🎉"}
                            {status === "error" && "Verification Failed"}
                        </h3>
                        <p className="text-green-100/90 text-lg">
                            {status === "verifying" && "Please wait while we confirm your transaction."}
                            {status === "success" && `Your ${creditsAdded} credits have been added to your account.`}
                            {status === "error" && "We couldn't verify your payment. Please contact support."}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {status === "success" && (
                        <Link
                            href="/tradesperson/leads"
                            className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all hover:shadow-lg flex items-center gap-2"
                        >
                            View Leads
                            <span className="text-lg">→</span>
                        </Link>
                    )}
                    <Link
                        href="/tradesperson/dashboard"
                        className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30"
                    >
                        Close
                    </Link>
                </div>
            </div>
        </div>
    );
}
