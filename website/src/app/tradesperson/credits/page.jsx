// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
// import { PLANS } from "@/app/api/topup/route";
// import CreditsTopUp from "./CreditsTopUp";
// import { CreditCard, Zap, Shield, CheckCircle, ArrowLeft, Star, TrendingUp, Clock, HelpCircle, Mail, Phone } from "lucide-react";
// import Link from "next/link";

// export const metadata = {
//   title: "Buy Credits | TradeConnect",
//   description: "Top up your credits to unlock more job leads",
// };

// export default async function CreditsPage() {
//   try {
//     // ✅ Get cookies from Next.js (server component)
//     const cookieStore = await cookies();
//     const cookieHeader = cookieStore.toString();

//     // ✅ Fetch user data with cookies (exactly like your leads page)
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/me`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Cookie': cookieHeader, // ← CRITICAL: Pass cookies
//       },
//       cache: 'no-store',
//     });

//     console.log("API Response status:", res.status);

//     if (!res.ok) {
//       console.log("API not ok, redirecting to login");
//       redirect("/auth/login");
//     }

//     const data = await res.json();
//     console.log("UserData", data);

//     if (!data || !data.success) {
//       console.log("No success in data, redirecting to login");
//       redirect("/auth/login");
//     }

//     const { user, tradespersonProfile } = data;

//     // ✅ Check if user exists and is a tradesperson
//     if (!user || user.role !== "TRADESPERSON") {
//       console.log("User not tradesperson, redirecting to login");
//       redirect("/auth/login");
//     }

//     // ✅ Check if tradesperson profile exists
//     if (!tradespersonProfile) {
//       console.log("No tradesperson profile, redirecting to setup");
//       redirect("/tradesperson/setup");
//     }

//     // ✅ Everything is good, render the page
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-zinc-900 dark:to-black">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           {/* Back Button */}
//           <div className="mb-8">
//             <Link
//               href="/tradesperson"
//               className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-[#155DFC] dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span className="font-medium">Back to Dashboard</span>
//             </Link>
//           </div>

//           {/* Header Section */}
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#155DFC] via-blue-500 to-blue-400 rounded-3xl mb-6 shadow-xl shadow-blue-500/30">
//               <CreditCard className="w-10 h-10 text-white" />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4 bg-clip-text">
//               Buy Credits
//             </h1>
//             <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
//               Each credit unlocks one job lead. Purchase credits to access customer contact information and grow your business.
//             </p>
//           </div>

//           {/* Current Balance Card */}
//           <div className="max-w-4xl mx-auto mb-12">
//             <div className="bg-gradient-to-br from-[#155DFC] via-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden">
//               {/* Animated background elements */}
//               <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
//               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
              
//               <div className="flex flex-col lg:flex-row items-center justify-between mb-8 relative z-10">
//                 <div className="mb-8 lg:mb-0 lg:max-w-lg">
//                   <h2 className="text-3xl font-bold mb-3">Your Credit Balance</h2>
//                   <p className="text-blue-100/90 text-lg mb-4">
//                     Ready to unlock new opportunities and grow your business
//                   </p>
//                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
//                     <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
//                     <span className="text-sm font-medium">Credits never expire</span>
//                   </div>
//                 </div>
                
//                 <div className="flex flex-col items-center">
//                   <div className="text-center mb-4">
//                     <div className="text-6xl font-black mb-2">{tradespersonProfile.credits || 0}</div>
//                     <div className="text-lg font-semibold text-blue-100">AVAILABLE CREDITS</div>
//                   </div>
//                   <div className="flex gap-2">
//                     <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
//                       ₹49.9/credit
//                     </div>
//                     <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
//                       Lifetime access
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Quick Stats */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
//                       <TrendingUp className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-blue-100/80">Average Value</div>
//                       <div className="text-2xl font-bold">  £0.99</div>
//                       <div className="text-xs text-blue-100/60">per credit</div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
//                       <Star className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-blue-100/80">Best Value</div>
//                       <div className="text-2xl font-bold">0.67</div>
//                       <div className="text-xs text-blue-100/60">Business plan</div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
//                       <Clock className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-blue-100/80">No Time Limit</div>
//                       <div className="text-2xl font-bold">∞</div>
//                       <div className="text-xs text-blue-100/60">Never expires</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Features Section */}
//           <div className="mb-16">
//             <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-10">
//               Why Choose Our Credits?
//             </h2>
//             <div className="grid md:grid-cols-3 gap-8">
//               <div className="bg-gradient-to-b from-white to-blue-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-blue-100 dark:border-blue-900/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-6">
//                   <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
//                   Instant Access
//                 </h3>
//                 <p className="text-zinc-600 dark:text-zinc-400">
//                   Get immediate access to customer contact details and job specifications after unlocking a lead. No waiting periods.
//                 </p>
//               </div>

//               <div className="bg-gradient-to-b from-white to-green-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-green-100 dark:border-green-900/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
//                 <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl flex items-center justify-center mb-6">
//                   <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
//                   Bank-Level Security
//                 </h3>
//                 <p className="text-zinc-600 dark:text-zinc-400">
//                   Powered by Stripe with 256-bit encryption. Your payment information is never stored on our servers.
//                 </p>
//               </div>

//               <div className="bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-purple-100 dark:border-purple-900/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
//                 <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mb-6">
//                   <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
//                   Lifetime Validity
//                 </h3>
//                 <p className="text-zinc-600 dark:text-zinc-400">
//                   Credits never expire. Use them whenever you find the perfect job opportunity, even years from now.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Pricing Plans Section */}
//           <div className="mb-20">
//             <div className="text-center mb-12">
//               <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
//                 Choose Your Plan
//               </h2>
//               <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
//                 Select the perfect plan for your business needs. All plans include full access and premium support.
//               </p>
//             </div>
            
//             <div className="grid lg:grid-cols-3 gap-8">
//               {Object.entries(PLANS).map(([key, plan]) => (
//                 <div 
//                   key={key}
//                   className={`rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
//                     key === 'pro' 
//                       ? 'bg-gradient-to-b from-[#155DFC]/5 to-[#155DFC]/10 dark:from-[#155DFC]/10 dark:to-[#155DFC]/5 border-2 border-[#155DFC] shadow-xl shadow-blue-500/20 relative'
//                       : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-lg'
//                   }`}
//                 >
//                   {key === 'pro' && (
//                     <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
//                       <div className="px-6 py-2 bg-gradient-to-r from-[#155DFC] to-blue-500 rounded-full text-white text-sm font-bold shadow-lg flex items-center gap-2">
//                         <Star className="w-4 h-4" />
//                         MOST POPULAR
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Plan Header */}
//                   <div className="mb-8">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
//                         {plan.name}
//                       </h3>
//                       {key === 'pro' && (
//                         <div className="px-3 py-1 bg-[#155DFC]/20 text-[#155DFC] dark:text-blue-400 text-xs font-bold rounded-full">
//                           RECOMMENDED
//                         </div>
//                       )}
//                     </div>
//                     <p className="text-zinc-600 dark:text-zinc-400 mb-6">
//                       {plan.description}
//                     </p>
                    
//                     {/* Price Display */}
//                     <div className="mb-6">
//                       <div className="flex items-baseline gap-2 mb-2">
//                         <span className="text-5xl font-black text-zinc-900 dark:text-white">
//                           ₹{plan.amount}
//                         </span>
//                         <span className="text-zinc-500 dark:text-zinc-400">
//                           one-time
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-4">
//                         <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold">
//                           {plan.credits} Credits
//                         </div>
//                         <div className="text-sm text-zinc-500 dark:text-zinc-400">
//                           ₹{(plan.amount / plan.credits).toFixed(1)} per credit
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Features List */}
//                   <div className="space-y-4 mb-8">
//                     <div className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                       <span className="text-zinc-700 dark:text-zinc-300">
//                         Unlock <strong>{plan.credits} job leads</strong> with complete details
//                       </span>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                       <span className="text-zinc-700 dark:text-zinc-300">
//                         Immediate access to customer contact information
//                       </span>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                       <span className="text-zinc-700 dark:text-zinc-300">
//                         Credits never expire - use anytime
//                       </span>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                       <span className="text-zinc-700 dark:text-zinc-300">
//                         Bank-level security with Stripe
//                       </span>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                       <span className="text-zinc-700 dark:text-zinc-300">
//                         24/7 customer support
//                       </span>
//                     </div>
//                   </div>

//                   {/* Buy Button */}
//                   <CreditsTopUp 
//                     plan={key} 
//                     profileId={tradespersonProfile._id}
//                     userId={user.id} 
//                     isPopular={key === 'pro'}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* FAQ Section */}
//           <div className="max-w-4xl mx-auto mb-16">
//             <div className="text-center mb-12">
//               <div className="inline-flex items-center gap-3 mb-4">
//                 <HelpCircle className="w-8 h-8 text-[#155DFC]" />
//                 <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
//                   Frequently Asked Questions
//                 </h2>
//               </div>
//               <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
//                 Get answers to common questions about credits and payments
//               </p>
//             </div>
            
//             <div className="grid md:grid-cols-2 gap-6">
//               {[
//                 {
//                   question: "How do credits work?",
//                   answer: "Each credit allows you to unlock one job lead. When you find a job you're interested in, use one credit to access the customer's contact information and complete job details."
//                 },
//                 {
//                   question: "What happens if I don't use all my credits?",
//                   answer: "Credits never expire. You can use them whenever you find the right job. They remain in your account until you use them, with no time limits."
//                 },
//                 {
//                   question: "Is my payment information secure?",
//                   answer: "Yes! We use Stripe, one of the world's most secure payment processors. We never store your credit card information on our servers - it's handled directly by Stripe."
//                 },
//                 {
//                   question: "Can I get a refund?",
//                   answer: "Credits are non-refundable as they provide immediate access to job leads. However, if you encounter any issues, please contact our support team for assistance."
//                 },
//                 {
//                   question: "How quickly are credits added?",
//                   answer: "Credits are added instantly after successful payment. You can start unlocking job leads immediately."
//                 },
//                 {
//                   question: "Can I buy more credits later?",
//                   answer: "Yes! You can purchase additional credits at any time. Your new credits will be added to your existing balance."
//                 }
//               ].map((faq, index) => (
//                 <div 
//                   key={index}
//                   className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-[#155DFC]/30 dark:hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg"
//                 >
//                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
//                     {faq.question}
//                   </h3>
//                   <p className="text-zinc-600 dark:text-zinc-400">
//                     {faq.answer}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contact Support Section */}
//           <div className="max-w-3xl mx-auto">
//             <div className="bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-800 dark:to-black rounded-3xl p-10 text-center relative overflow-hidden">
//               {/* Background pattern */}
//               <div className="absolute inset-0 bg-gradient-to-br from-[#155DFC]/5 to-transparent"></div>
              
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-br from-[#155DFC] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
//                   <HelpCircle className="w-8 h-8 text-white" />
//                 </div>
                
//                 <h3 className="text-2xl font-bold text-white mb-3">Need Help?</h3>
//                 <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
//                   Our dedicated support team is here to help you with any questions about credits, payments, or your account.
//                 </p>
                
//                 <div className="grid md:grid-cols-2 gap-6 mb-8">
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
//                         <Mail className="w-6 h-6 text-white" />
//                       </div>
//                       <div className="text-left">
//                         <div className="font-semibold text-white mb-1">Email Support</div>
//                         <a 
//                           href="mailto:support@tradeconnect.com" 
//                           className="text-blue-300 hover:text-blue-200 transition-colors"
//                         >
//                           support@tradeconnect.com
//                         </a>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
//                         <Phone className="w-6 h-6 text-white" />
//                       </div>
//                       <div className="text-left">
//                         <div className="font-semibold text-white mb-1">Phone Support</div>
//                         <div className="text-green-300">+91 1800-123-4567</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Link
//                     href="/tradesperson"
//                     className="px-8 py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-all hover:shadow-lg"
//                   >
//                     Return to Dashboard
//                   </Link>
//                   <button className="px-8 py-3 bg-gradient-to-r from-[#155DFC] to-blue-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all">
//                     Live Chat Support
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error("Error in CreditsPage:", error);
//     redirect("/auth/login");
//   }
// }












import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PLANS } from "@/app/api/topup/route";
import CreditsTopUp from "./CreditsTopUp";
import { CreditCard, Zap, Shield, CheckCircle, ArrowLeft, Star, TrendingUp, Clock, HelpCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Buy Credits | TradeConnect",
  description: "Top up your credits to unlock more job leads",
};

export default async function CreditsPage() {
  try {
    // ✅ Get cookies from Next.js (server component)
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // ✅ Fetch user data with cookies
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/me`, {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://allcarepros.ca'}/api/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      cache: 'no-store',
    });





    

    console.log("API Response status:", res.status);

    if (!res.ok) {
      console.log("API not ok, redirecting to login");
      redirect("/auth/login");
    }

    const data = await res.json();
    console.log("UserData", data);

    if (!data || !data.success) {
      console.log("No success in data, redirecting to login");
      redirect("/auth/login");
    }

    const { user, tradespersonProfile } = data;

    // ✅ Check if user exists and is a tradesperson
    if (!user || user.role !== "TRADESPERSON") {
      console.log("User not tradesperson, redirecting to login");
      redirect("/auth/login");
    }

    // ✅ Check if tradesperson profile exists
    if (!tradespersonProfile) {
      console.log("No tradesperson profile, redirecting to setup");
      redirect("/tradesperson/setup");
    }

    // Calculate per credit prices from PLANS
    const calculatePerCreditPrice = (amount, credits) => {
      return (amount / credits).toFixed(2);
    };

    const starterPerCredit = calculatePerCreditPrice(PLANS.starter.amount, PLANS.starter.credits);
    const proPerCredit = calculatePerCreditPrice(PLANS.pro.amount, PLANS.pro.credits);
    const businessPerCredit = calculatePerCreditPrice(PLANS.business.amount, PLANS.business.credits);
    const averagePerCredit = ((parseFloat(starterPerCredit) + parseFloat(proPerCredit) + parseFloat(businessPerCredit)) / 3).toFixed(2);

    // ✅ Everything is good, render the page
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-zinc-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/tradesperson"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-[#155DFC] dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#155DFC] via-blue-500 to-blue-400 rounded-3xl mb-6 shadow-xl shadow-blue-500/30">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4 bg-clip-text">
              Buy Credits
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Each credit unlocks one job lead. Purchase credits to access customer contact information and grow your business.
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#155DFC] via-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
              
              <div className="flex flex-col lg:flex-row items-center justify-between mb-8 relative z-10">
                <div className="mb-8 lg:mb-0 lg:max-w-lg">
                  <h2 className="text-3xl font-bold mb-3">Your Credit Balance</h2>
                  <p className="text-blue-100/90 text-lg mb-4">
                    Ready to unlock new opportunities and grow your business
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span className="text-sm font-medium">Credits never expire</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-center mb-4">
                    <div className="text-6xl font-black mb-2">{tradespersonProfile.credits || 0}</div>
                    <div className="text-lg font-semibold text-blue-100">AVAILABLE CREDITS</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      £{averagePerCredit}/credit
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      Lifetime access
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-100/80">Average Value</div>
                      <div className="text-2xl font-bold">£{averagePerCredit}</div>
                      <div className="text-xs text-blue-100/60">per credit</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-100/80">Best Value</div>
                      <div className="text-2xl font-bold">£{businessPerCredit}</div>
                      <div className="text-xs text-blue-100/60">Business plan</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-100/80">No Time Limit</div>
                      <div className="text-2xl font-bold">∞</div>
                      <div className="text-xs text-blue-100/60">Never expires</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-10">
              Why Choose Our Credits?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-white to-blue-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-blue-100 dark:border-blue-900/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                  Instant Access
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Get immediate access to customer contact details and job specifications after unlocking a lead. No waiting periods.
                </p>
              </div>

              <div className="bg-gradient-to-b from-white to-green-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-green-100 dark:border-green-900/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                  Bank-Level Security
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Powered by Stripe with 256-bit encryption. Your payment information is never stored on our servers.
                </p>
              </div>

              <div className="bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 border-2 border-purple-100 dark:border-purple-900/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                  Lifetime Validity
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Credits never expire. Use them whenever you find the perfect job opportunity, even years from now.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Plans Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Select the perfect plan for your business needs. All plans include full access and premium support.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {Object.entries(PLANS).map(([key, plan]) => {
                const perCreditPrice = (plan.amount / plan.credits).toFixed(2);
                
                return (
                  <div 
                    key={key}
                    className={`rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                      key === 'pro' 
                        ? 'bg-gradient-to-b from-[#155DFC]/5 to-[#155DFC]/10 dark:from-[#155DFC]/10 dark:to-[#155DFC]/5 border-2 border-[#155DFC] shadow-xl shadow-blue-500/20 relative'
                        : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-lg'
                    }`}
                  >
                    {key === 'pro' && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="px-6 py-2 bg-gradient-to-r from-[#155DFC] to-blue-500 rounded-full text-white text-sm font-bold shadow-lg flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          MOST POPULAR
                        </div>
                      </div>
                    )}
                    
                    {/* Plan Header */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                          {plan.name}
                        </h3>
                        {key === 'pro' && (
                          <div className="px-3 py-1 bg-[#155DFC]/20 text-[#155DFC] dark:text-blue-400 text-xs font-bold rounded-full">
                            RECOMMENDED
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        {plan.description}
                      </p>
                      
                      {/* Price Display */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-5xl font-black text-zinc-900 dark:text-white">
                            £{plan.amount}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            one-time
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold">
                            {plan.credits} Credits
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            £{perCreditPrice} per credit
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Unlock <strong>{plan.credits} job leads</strong> with complete details
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Immediate access to customer contact information
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Credits never expire - use anytime
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Bank-level security with Stripe
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          24/7 customer support
                        </span>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <CreditsTopUp 
                      plan={key} 
                      profileId={tradespersonProfile._id}
                      userId={user.id} 
                      isPopular={key === 'pro'}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <HelpCircle className="w-8 h-8 text-[#155DFC]" />
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Get answers to common questions about credits and payments
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  question: "How do credits work?",
                  answer: "Each credit allows you to unlock one job lead. When you find a job you're interested in, use one credit to access the customer's contact information and complete job details."
                },
                {
                  question: "What happens if you don't use all credits?",
                  answer: "Credits never expire. You can use them whenever you find the right job. They remain in your account until you use them, with no time limits."
                },
                {
                  question: "Is payment information secure?",
                  answer: "Yes! We use Stripe, one of the world's most secure payment processors. We never store your credit card information on our servers - it's handled directly by Stripe."
                },
                {
                  question: "Can you get a refund?",
                  answer: "Credits are non-refundable as they provide immediate access to job leads. However, if you encounter any issues, please contact our support team for assistance."
                },
                {
                  question: "How quickly are credits added?",
                  answer: "Credits are added instantly after successful payment. You can start unlocking job leads immediately."
                },
                {
                  question: "Can you buy more credits later?",
                  answer: "Yes! You can purchase additional credits at any time. Your new credits will be added to your existing balance."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-[#155DFC]/30 dark:hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg"
                >
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Section */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-800 dark:to-black rounded-3xl p-10 text-center relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#155DFC]/5 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#155DFC] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">Need Help?</h3>
                <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
                  Our dedicated support team is here to help you with any questions about credits, payments, or your account.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white mb-1">Email Support</div>
                        <a 
                          href="mailto:support@tradeconnect.com" 
                          className="text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          support@tradeconnect.com
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white mb-1">Phone Support</div>
                        <div className="text-green-300">+44 1800-123-4567</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/tradesperson"
                    className="px-8 py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-all hover:shadow-lg"
                  >
                    Return to Dashboard
                  </Link>
                  <button className="px-8 py-3 bg-gradient-to-r from-[#155DFC] to-blue-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                    Live Chat Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CreditsPage:", error);
    redirect("/auth/login");
  }
}