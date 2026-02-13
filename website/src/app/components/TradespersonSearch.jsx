// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";

// export default function TradespersonSearch({ onCancel, onReturnToJob }) {
//   const router = useRouter(); // ✅ FIX

//   const [postcode, setPostcode] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [tradespeople, setTradespeople] = useState([]);
//   const [showResults, setShowResults] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     if (!postcode.trim()) {
//       toast.error("Please enter a postcode", { position: "top-center" });
//       return;
//     }

//     const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
//     if (!postcodeRegex.test(postcode)) {
//       toast.error("Please enter a valid UK postcode (e.g., SW1A 1AA)", {
//         position: "top-center",
//       });
//       return;
//     }

//     try {
//       setSearching(true);

//       const res = await fetch(
//         `/api/tradesperson/search?postcode=${encodeURIComponent(postcode)}`
//       );
//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Search failed");

//       setTradespeople(data.data || []);
//       setShowResults(true);

//       if (data.count === 0) {
//         toast.info("No tradespeople found in your area", {
//           position: "top-center",
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Failed to search tradespeople", {
//         position: "top-center",
//       });
//       setTradespeople([]);
//       setShowResults(true);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleCallNow = (phone) => {
//     toast.success(`Calling ${phone}...`, {
//       position: "top-center",
//       duration: 2000,
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Rated people
//           </h1>
//           <p className="text-gray-600">
//             Find trusted tradespeople in your area
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* LEFT */}
//           <div className="lg:col-span-1">
//             <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
//               <form onSubmit={handleSearch} className="space-y-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Enter your postcode
//                 </label>
//                 <input
//                   type="text"
//                   value={postcode}
//                   onChange={(e) => setPostcode(e.target.value.toUpperCase())}
//                   placeholder="SW1A 1AA"
//                   className="w-full p-3 border-2 border-gray-300 rounded-lg uppercase"
//                 />

//                 <button
//                   type="submit"
//                   disabled={searching}
//                   className="w-full bg-[#1149C7] text-white py-3 rounded-lg"
//                 >
//                   {searching ? "Searching..." : "Show tradespeople"}
//                 </button>
//               </form>

//               <div className="mt-6 space-y-3">
//                 <button
//                   onClick={onReturnToJob}
//                   className="w-full border-2 border-[#1149C7] text-[#1149C7] py-3 rounded-lg"
//                 >
//                   Return to job post
//                 </button>

//                 <button
//                   onClick={onCancel}
//                   className="w-full border-2 border-gray-300 py-3 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="lg:col-span-2">
//             {showResults && (
//               <>
//                 <h2 className="text-2xl font-bold mb-4">
//                   Tradespeople in {postcode}
//                 </h2>

//                 {tradespeople.length > 0 ? (
//                   <div className="space-y-6">
//                     {tradespeople.map((trade) => (
//                       <div
//                         key={trade._id}
//                         className="border rounded-xl p-6 flex justify-between"
//                       >
//                         <div>
//                           <h3 className="text-xl font-bold">
//                             {trade.companyName}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             {trade.bio}
//                           </p>
//                         </div>

//                         <div className="flex flex-col gap-2">
//                           <button
//                             onClick={() =>
//                               router.push(`/tradespeople/${trade._id}`)
//                             }
//                             className="border-2 border-[#1149C7] text-[#1149C7] px-4 py-2 rounded-lg"
//                           >
//                             View profile
//                           </button>

//                           {trade.phone && (
//                             <button
//                               onClick={() => handleCallNow(trade.phone)}
//                               className="bg-[#1149C7] text-white px-4 py-2 rounded-lg"
//                             >
//                               Call now
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p>No tradespeople found</p>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }























"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function TradespersonSearch({ onCancel, onReturnToJob }) {
  const router = useRouter();

  const [postcode, setPostcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [tradespeople, setTradespeople] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!postcode.trim()) {
      toast.error("Please enter a postcode", { position: "top-center" });
      return;
    }

    const postcodeRegex = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
    if (!postcodeRegex.test(postcode)) {
      toast.error("Please enter a valid Canadian postal code (e.g., A1A 1A1)", {
        position: "top-center",
      });
      return;
    }

    try {
      setSearching(true);

      const res = await fetch(
        `/api/tradesperson/search?postcode=${encodeURIComponent(postcode)}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Search failed");

      setTradespeople(data.data || []);
      setShowResults(true);

      if (data.count === 0) {
        toast("No tradespeople found in your area", {
          position: "top-center",
          icon: "ℹ️",
        });
      } else {
        toast.success(`Found ${data.count} tradespeople in your area`, {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to search tradespeople", {
        position: "top-center",
      });
      setTradespeople([]);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  };

  const handleCallNow = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              rated people
            </h1>
            <p className="text-gray-600">
              Find trusted tradespeople in your area
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT - Search Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your postcode
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="A1A 1A1"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg uppercase focus:border-[#1149C7] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searching}
                    className="w-full bg-[#1149C7] hover:bg-[#0d38a0] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Searching...
                      </span>
                    ) : (
                      "Show tradespeople"
                    )}
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {onReturnToJob && (
                    <button
                      onClick={onReturnToJob}
                      className="w-full border-2 border-[#1149C7] text-[#1149C7] hover:bg-blue-50 py-3 rounded-lg font-medium transition-colors"
                    >
                      Return to job post
                    </button>
                  )}

                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="w-full border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - Results */}
            <div className="lg:col-span-2">
              {!showResults ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Search for tradespeople
                  </h3>
                  <p className="text-gray-600">
                    Enter your postcode to find local professionals
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Tradespeople in {postcode}
                    </h2>
                    <p className="text-gray-600">
                      {tradespeople.length} {tradespeople.length === 1 ? 'result' : 'results'} found
                    </p>
                  </div>

                  {tradespeople.length > 0 ? (
                    <div className="space-y-6">
                      {tradespeople.map((trade) => (
                        <div
                          key={trade._id}
                          className="border-2 border-gray-200 hover:border-[#1149C7] rounded-xl p-6 transition-all hover:shadow-lg"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            {/* Tradesperson Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                {/* Profile Image */}
                                <div className="flex-shrink-0">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    {trade.profileImage ? (
                                      <img
                                        src={trade.profileImage}
                                        alt={trade.companyName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                                        🏢
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Company Details */}
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {trade.companyName}
                                  </h3>

                                  {/* Rating */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <span
                                          key={i}
                                          className={`text-sm ${i < Math.round(trade.average_rating || 5) ? "text-yellow-400" : "text-gray-300"}`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {(trade.average_rating || 5).toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      ({trade.total_ratings || 0} {trade.total_ratings === 1 ? 'rating' : 'ratings'})
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {trade.bio || "Professional tradesperson"}
                                  </p>

                                  {/* Skills */}
                                  {trade.skills && trade.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {trade.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {trade.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                          +{trade.skills.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 md:w-48">
                              <button
                                onClick={() => router.push(`/tradespeople/${trade._id}`)}
                                className="w-full border-2 border-[#1149C7] text-[#1149C7] hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                View profile
                              </button>

                              {trade.phone && (
                                <button
                                  onClick={() => handleCallNow(trade.phone)}
                                  className="w-full bg-[#1149C7] hover:bg-[#0d38a0] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  📞 Call now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No tradespeople found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any tradespeople in your area for this postcode.
                      </p>
                      <button
                        onClick={() => {
                          setPostcode("");
                          setShowResults(false);
                        }}
                        className="px-6 py-3 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition-colors"
                      >
                        Try another postcode
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}