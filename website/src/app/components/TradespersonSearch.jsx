"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TradespersonSearch({ onCancel, onReturnToJob }) {
  const router = useRouter(); // ✅ FIX

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

    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      toast.error("Please enter a valid UK postcode (e.g., SW1A 1AA)", {
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
        toast.info("No tradespeople found in your area", {
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
    toast.success(`Calling ${phone}...`, {
      position: "top-center",
      duration: 2000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rated people
          </h1>
          <p className="text-gray-600">
            Find trusted tradespeople in your area
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Enter your postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  placeholder="SW1A 1AA"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg uppercase"
                />

                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-[#1149C7] text-white py-3 rounded-lg"
                >
                  {searching ? "Searching..." : "Show tradespeople"}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <button
                  onClick={onReturnToJob}
                  className="w-full border-2 border-[#1149C7] text-[#1149C7] py-3 rounded-lg"
                >
                  Return to job post
                </button>

                <button
                  onClick={onCancel}
                  className="w-full border-2 border-gray-300 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  Tradespeople in {postcode}
                </h2>

                {tradespeople.length > 0 ? (
                  <div className="space-y-6">
                    {tradespeople.map((trade) => (
                      <div
                        key={trade._id}
                        className="border rounded-xl p-6 flex justify-between"
                      >
                        <div>
                          <h3 className="text-xl font-bold">
                            {trade.companyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {trade.bio}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() =>
                              router.push(`/tradespeople/${trade._id}`)
                            }
                            className="border-2 border-[#1149C7] text-[#1149C7] px-4 py-2 rounded-lg"
                          >
                            View profile
                          </button>

                          {trade.phone && (
                            <button
                              onClick={() => handleCallNow(trade.phone)}
                              className="bg-[#1149C7] text-white px-4 py-2 rounded-lg"
                            >
                              Call now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No tradespeople found</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
