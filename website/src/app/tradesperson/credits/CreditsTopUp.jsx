// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { CreditCard, Loader2, Lock, Check, Shield } from "lucide-react";

// export default function CreditsTopUp({ plan, profileId, isPopular = false }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   const handleTopUp = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch("/api/topup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ plan }),
//         credentials: 'include'
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Something went wrong");
//       }

//       // Redirect to Stripe Checkout
//       if (data.url) {
//         window.location.href = data.url;
//       } else {
//         throw new Error("No checkout URL received");
//       }
      
//     } catch (error) {
//       console.error("Error creating checkout session:", error);
//       setError(error.message || "Failed to process payment. Please try again.");
      
//       // Auto-hide error after 5 seconds
//       setTimeout(() => {
//         setError(null);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {error && (
//         <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in slide-in-from-top duration-300">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
//               <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
//             </div>
//             <div>
//               <div className="font-semibold text-red-800 dark:text-red-300 mb-1">Payment Failed</div>
//               <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <button
//         onClick={handleTopUp}
//         disabled={loading}
//         className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
//           isPopular
//             ? "bg-gradient-to-r from-[#155DFC] via-blue-600 to-blue-500 text-white hover:shadow-2xl hover:shadow-blue-500/40"
//             : "bg-gradient-to-r from-zinc-900 via-zinc-800 to-black dark:from-zinc-800 dark:via-zinc-900 dark:to-black text-white hover:shadow-2xl hover:shadow-black/30"
//         } ${loading ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
//       >
//         {/* Shimmer effect */}
//         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
//         {/* Loading state */}
//         {loading ? (
//           <>
//             <div className="relative z-10 flex items-center gap-3">
//               <Loader2 className="w-5 h-5 animate-spin" />
//               <span>Processing Payment...</span>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="relative z-10 flex items-center gap-3">
//               <CreditCard className="w-5 h-5" />
//               <span>Buy Now</span>
//             </div>
//             <div className="relative z-10 ml-2 text-xs opacity-90 flex items-center gap-1">
//               <Shield className="w-3 h-3" />
//               Secure
//             </div>
//           </>
//         )}
//       </button>
      
//       {/* Trust badges */}
//       <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
//         <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
//           <Check className="w-3 h-3 text-green-500" />
//           <span>30-day money-back guarantee</span>
//         </div>
//         <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
//           <div className="w-3 h-3 rounded-full bg-green-500"></div>
//           <span>SSL encrypted payment</span>
//         </div>
//         <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
//           Powered by Stripe • Your payment is secure
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Lock, Check, Shield } from "lucide-react";

export default function CreditsTopUp({ plan, profileId, isPopular = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleTopUp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Sending payment request for plan:", plan, "profileId:", profileId);
      
      const response = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();
      
      console.log("Payment API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
      
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError(error.message || "Failed to process payment. Please try again.");
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="font-semibold text-red-800 dark:text-red-300 mb-1">Payment Failed</div>
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleTopUp}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
          isPopular
            ? "bg-gradient-to-r from-[#155DFC] via-blue-600 to-blue-500 text-white hover:shadow-2xl hover:shadow-blue-500/40"
            : "bg-gradient-to-r from-zinc-900 via-zinc-800 to-black dark:from-zinc-800 dark:via-zinc-900 dark:to-black text-white hover:shadow-2xl hover:shadow-black/30"
        } ${loading ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {/* Loading state */}
        {loading ? (
          <>
            <div className="relative z-10 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </div>
          </>
        ) : (
          <>
            <div className="relative z-10 flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>Buy Now</span>
            </div>
            <div className="relative z-10 ml-2 text-xs opacity-90 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure
            </div>
          </>
        )}
      </button>
      
      {/* Trust badges */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Check className="w-3 h-3 text-green-500" />
          <span>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>SSL encrypted payment</span>
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Powered by Stripe • Your payment is secure
        </div>
      </div>
    </div>
  );
}