// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";

// export default function TradespersonProfileDetail({ profileId }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     if (profileId) {
//       fetchProfile();
//     }
//   }, [profileId]);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/tradespeople/${profileId}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load profile");
//       }

//       setProfile(data.data);
//     } catch (error) {
//       console.error("Profile load error:", error);
//       toast.error("Failed to load profile", {
//         position: "top-center",
//       });
//       router.back();
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="text-center py-12">
//         <h3 className="text-xl font-bold text-gray-800 mb-2">
//           Profile not found
//         </h3>
//         <button
//           onClick={() => router.back()}
//           className="py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition"
//         >
//           Go back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8">
//       {/* Header */}
//       <div className="mb-6">
//         <button
//           onClick={() => router.back()}
//           className="text-[#1149C7] hover:text-[#0d38a0] font-medium mb-4 inline-flex items-center gap-2"
//         >
//           ← Back to search
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900">rated people</h1>
//       </div>

//       {/* Profile Card */}
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
//         {/* Profile Header */}
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8">
//           <div className="flex flex-col md:flex-row md:items-center gap-6">
//             {/* Profile Image */}
//             <div className="flex-shrink-0">
//               <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border-4 border-white shadow-lg">
//                 {profile.profileImage ? (
//                   <img
//                     src={profile.profileImage}
//                     alt={profile.companyName}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-gray-100 text-3xl text-gray-400">
//                     🏢
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Company Info */}
//             <div className="flex-grow">
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">
//                 {profile.companyName}
//               </h2>
//               <p className="text-gray-600 mb-3">
//                 {profile.serviceAreas?.join(", ")} • {profile.postcode}
//               </p>

//               {/* Ratings */}
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <div key={i} className="text-yellow-400 text-xl">★</div>
//                   ))}
//                 </div>
//                 <span className="text-lg font-semibold text-gray-900">
//                   5.0
//                 </span>
//                 <span className="text-gray-600">
//                   Excellent 27 ratings {/* Dynamic in production */}
//                 </span>
//               </div>

//               {/* Call Button */}
//               {profile.phone && (
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={() => {
//                       toast.success(`Calling ${profile.phone}...`, {
//                         position: "top-center",
//                       });
//                     }}
//                     className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
//                   >
//                     📞 Get a quote
//                   </button>
//                   <span className="text-lg font-bold text-gray-900">
//                     {profile.phone}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="border-b border-gray-200">
//           <div className="flex overflow-x-auto">
//             {["About", "Trades & services", "Reviews & ratings", "Work gallery"].map((tab) => (
//               <button
//                 key={tab}
//                 className="px-6 py-4 font-medium text-gray-600 hover:text-[#1149C7] border-b-2 border-transparent hover:border-[#1149C7] whitespace-nowrap transition"
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 md:p-8">
//           {/* About Section */}
//           <div className="mb-8">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4">About</h3>
//             <div className="prose max-w-none">
//               <p className="text-gray-700 leading-relaxed">
//                 {profile.bio || "No description provided."}
//               </p>
//             </div>
//           </div>

//           {/* Trades & Services */}
//           {profile.skills && profile.skills.length > 0 && (
//             <div className="mb-8">
//               <h3 className="text-2xl font-bold text-gray-800 mb-4">
//                 Trades & services
//               </h3>
//               <div className="flex flex-wrap gap-3">
//                 {profile.skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Service Areas */}
//           {profile.serviceAreas && profile.serviceAreas.length > 0 && (
//             <div className="mb-8">
//               <h3 className="text-2xl font-bold text-gray-800 mb-4">
//                 Service areas
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {profile.serviceAreas.map((area, index) => (
//                   <span
//                     key={index}
//                     className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
//                   >
//                     {area}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Contact Info */}
//           <div className="bg-gray-50 rounded-xl p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               Contact Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {profile.phone && (
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Phone</p>
//                   <p className="font-medium text-gray-900">{profile.phone}</p>
//                 </div>
//               )}
//               {profile.postcode && (
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Location</p>
//                   <p className="font-medium text-gray-900">{profile.postcode}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CTA */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
//         <h3 className="text-2xl font-bold mb-2">
//           Find reliable, vetted tradespeople right in your neighborhood. 
//         </h3>
//         <p className="mb-6 opacity-90">
//           Connect with local tradespeople like {profile.companyName}
//         </p>
//         <button
//           onClick={() => router.push("/create-job")}
//           className="bg-white text-[#1149C7] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition"
//         >
//           Post a job now
//         </button>
//       </div>
//     </div>
//   );
// }































"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function TradespersonProfileDetail({ profileId }) {
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (profileId) {
      fetchProfileAndRatings();
    }
  }, [profileId]);

  const fetchProfileAndRatings = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const profileRes = await fetch(`/api/tradespeople/${profileId}`);
      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(profileData.message || "Failed to load profile");
      }

      setProfile(profileData.data);

      // Fetch ratings
      try {
        const ratingsRes = await fetch(`/api/tradesperson/ratings?tradespersonId=${profileId}`);
        const ratingsData = await ratingsRes.json();

        if (ratingsRes.ok) {
          setRatings(ratingsData.ratings || []);
          setRatingStats({
            average: ratingsData.averageRating || 0,
            total: ratingsData.totalRatings || 0
          });
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
        // Continue even if ratings fail
      }

    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile", {
        position: "top-center",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Profile not found
        </h3>
        <button
          onClick={() => router.back()}
          className="py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition"
        >
          Go back
        </button>
      </div>
    );
  }

  const averageRating = ratingStats?.average || profile.average_rating || 0;
  const totalRatings = ratingStats?.total || profile.total_ratings || 0;

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#1149C7] hover:text-[#0d38a0] font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to search
          </button>
          <h1 className="text-3xl font-bold text-gray-900">rated people</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border-4 border-white shadow-lg">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-3xl text-gray-400">
                      🏢
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.companyName}
                </h2>
                <p className="text-gray-600 mb-3">
                  {profile.serviceAreas?.join(", ")} • {profile.postcode}
                </p>

                {/* Ratings */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${i < Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings yet'}
                  </span>
                  {totalRatings > 0 && (
                    <span className="text-gray-600">
                      {totalRatings === 1 ? '1 rating' : `${totalRatings} ratings`}
                    </span>
                  )}
                </div>

                {/* Call Button */}
                {profile.phone && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      onClick={() => {
                        window.location.href = `tel:${profile.phone}`;
                      }}
                      className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
                    >
                      📞 Get a quote
                    </button>
                    <span className="text-lg font-bold text-gray-900">
                      {profile.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {["About", "Trades & services", `Reviews (${totalRatings})`, "Contact"].map((tab) => (
                <button
                  key={tab}
                  className="px-6 py-4 font-medium text-gray-600 hover:text-[#1149C7] border-b-2 border-transparent hover:border-[#1149C7] whitespace-nowrap transition"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* About Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">About</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || "No description provided."}
                </p>
              </div>
            </div>

            {/* Trades & Services */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Trades & services
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {ratings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Reviews & ratings ({totalRatings})
                </h3>
                <div className="space-y-4">
                  {ratings.map((review, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">
                              {review.homeownerName || "Anonymous"}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${i < review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          {review.jobCategory && (
                            <p className="text-sm text-gray-600">
                              {review.jobCategory}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.review}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {profile.serviceAreas && profile.serviceAreas.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Service areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{profile.phone}</p>
                  </div>
                )}
                {profile.postcode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-900">{profile.postcode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">
            Find reliable, vetted tradespeople right in your neighborhood.
          </h3>
          <p className="mb-6 opacity-90">
            Connect with local tradespeople like {profile.companyName}
          </p>
          <button
            onClick={() => router.push("/create-job")}
            className="bg-white text-[#1149C7] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition"
          >
            Post a job now
          </button>
        </div>
      </div>
    </>
  );
}