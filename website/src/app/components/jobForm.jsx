
// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { toast, Toaster } from "react-hot-toast";

// // Validation Constants
// const VALIDATION_RULES = {
//   MEDIA: {
//     MAX_FILES: 2,
//     MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//     MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10MB
//     ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
//     ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
//   },
//   DESCRIPTION: {
//     MIN_LENGTH: 25,
//     MAX_LENGTH: 100,
//   },
//   BUDGET: {
//     MIN: 50,
//     MAX: 100000,
//   },
//   PHONE: {
//     PATTERN: /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
//   },
//   POSTCODE: {
//     PATTERN: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
//   }
// };

// // Tradesperson Search Component
// function TradespersonSearch({ onCancel, onReturnToJob }) {
//   const [postcode, setPostcode] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [tradespeople, setTradespeople] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const router = useRouter();

//   const handleSearch = async (e) => {
//     e.preventDefault();
    
//     if (!postcode.trim()) {
//       toast.error("Please enter a postcode", {
//         position: "top-center",
//       });
//       return;
//     }

//     // Basic UK postcode validation
//     const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
//     if (!postcodeRegex.test(postcode)) {
//       toast.error("Please enter a valid UK postcode (e.g., SW1A 1AA)", {
//         position: "top-center",
//       });
//       return;
//     }

//     try {
//       setSearching(true);
//       const response = await fetch(`/api/tradesperson/search?postcode=${encodeURIComponent(postcode)}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Search failed");
//       }

//       setTradespeople(data.data || []);
//       setShowResults(true);
      
//       if (data.count === 0) {
//         toast.info("No tradespeople found in your area", {
//           position: "top-center",
//         });
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       toast.error(error.message || "Failed to search tradespeople", {
//         position: "top-center",
//       });
//       setTradespeople([]);
//       setShowResults(true);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleCallNow = (phoneNumber) => {
//     toast.success(`Calling ${phoneNumber}...`, {
//       position: "top-center",
//       duration: 2000,
//     });
//     console.log(`Calling: ${phoneNumber}`);
//   };

//   const handleViewProfile = (profileId) => {
//     router.push(`/tradespeople/${profileId}`);
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8 mt-15">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">rated people</h1>
//           <p className="text-gray-600">
//             Find trusted tradespeople in your area
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Search Form */}
//           <div className="lg:col-span-1">
//             <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
//               <h2 className="text-xl font-bold text-gray-800 mb-6">
//                 Prefer to make a call?
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Get a list of local tradespeople you can contact directly.
//               </p>

//               <form onSubmit={handleSearch} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Enter your postcode
//                   </label>
//                   <input
//                     type="text"
//                     value={postcode}
//                     onChange={(e) => setPostcode(e.target.value.toUpperCase())}
//                     placeholder="SW1A 1AA"
//                     className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition uppercase"
//                     pattern="^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$"
//                   />
//                   <p className="mt-1 text-xs text-gray-500">
//                     UK postcode format (e.g., SW1A 1AA)
//                   </p>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={searching}
//                   className="w-full bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {searching ? "Searching..." : "Yes, show me tradespeople"}
//                 </button>
//               </form>

//               {/* Navigation Buttons */}
//               <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
//                 <button
//                   onClick={onReturnToJob}
//                   className="w-full py-3 border-2 border-[#1149C7] text-[#1149C7] rounded-lg font-medium hover:bg-blue-50 transition"
//                 >
//                   Return to job post
//                 </button>
//                 <button
//                   onClick={onCancel}
//                   className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
//                 >
//                   No, cancel job post
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Results */}
//           <div className="lg:col-span-2">
//             {!showResults ? (
//               // Initial state - Timeline options
//               <div className="space-y-6">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-4">
//                   When to post
//                 </h2>
                
//                 <div className="space-y-3">
//                   {[
//                     { label: "Urgent", value: "URGENT" },
//                     { label: "Within 2 weeks", value: "WITHIN_2_WEEKS" },
//                     { label: "Within 2 months", value: "WITHIN_2_MONTHS" },
//                     { label: "2 months+", value: "FLEXIBLE" },
//                   ].map((option) => (
//                     <div
//                       key={option.value}
//                       className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer"
//                     >
//                       <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
//                       <span className="text-gray-700">{option.label}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <p className="text-blue-800 text-sm">
//                     <span className="font-semibold">Tip:</span> Posting your job for free allows you to compare quotes and read reviews from local tradespeople.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               // Search Results
//               <div>
//                 <div className="flex items-center justify-between mb-6">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-800">
//                       Fitted Kitchens in {postcode}
//                     </h2>
//                     <p className="text-gray-600">
//                       {tradespeople.length} tradespeople found in your area
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setShowResults(false)}
//                     className="text-[#1149C7] hover:text-[#0d38a0] font-medium"
//                   >
//                     ← Back to search
//                   </button>
//                 </div>

//                 {tradespeople.length > 0 ? (
//                   <div className="space-y-6">
//                     {tradespeople.map((trade, index) => (
//                       <div key={trade._id || index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
//                         <div className="p-6">
//                           <div className="flex flex-col md:flex-row md:items-center gap-4">
//                             {/* Profile Image */}
//                             <div className="flex-shrink-0">
//                               <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
//                                 {trade.profileImage ? (
//                                   <img
//                                     src={trade.profileImage}
//                                     alt={trade.companyName}
//                                     className="w-full h-full object-cover"
//                                   />
//                                 ) : (
//                                   <div className="text-2xl text-gray-400">🏢</div>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Company Info */}
//                             <div className="flex-grow">
//                               <h3 className="text-xl font-bold text-gray-900 mb-1">
//                                 {trade.companyName}
//                               </h3>
                              
//                               {/* Ratings */}
//                               <div className="flex items-center gap-2 mb-2">
//                                 <div className="flex">
//                                   {[...Array(5)].map((_, i) => (
//                                     <div key={i} className="text-yellow-400">★</div>
//                                   ))}
//                                 </div>
//                                 <span className="text-sm text-gray-600">
//                                   {trade.ratingCount || 27} ratings
//                                 </span>
//                               </div>

//                               {/* Bio */}
//                               {trade.bio && (
//                                 <p className="text-gray-600 text-sm line-clamp-2 mb-3">
//                                   {trade.bio}
//                                 </p>
//                               )}

//                               {/* Skills */}
//                               {trade.skills && trade.skills.length > 0 && (
//                                 <div className="flex flex-wrap gap-2 mb-3">
//                                   {trade.skills.slice(0, 3).map((skill, idx) => (
//                                     <span
//                                       key={idx}
//                                       className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
//                                     >
//                                       {skill}
//                                     </span>
//                                   ))}
//                                   {trade.skills.length > 3 && (
//                                     <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                                       +{trade.skills.length - 3} more
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex flex-col gap-2 min-w-[150px]">
//                               <button
//                                 onClick={() => handleViewProfile(trade._id)}
//                                 className="py-2 px-4 border-2 border-[#1149C7] text-[#1149C7] rounded-lg font-medium hover:bg-blue-50 transition text-sm"
//                               >
//                                 View profile
//                               </button>
//                               {trade.phone && (
//                                 <button
//                                   onClick={() => handleCallNow(trade.phone)}
//                                   className="py-2 px-4 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition text-sm"
//                                 >
//                                   Call now
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="text-6xl mb-4">🔍</div>
//                     <h3 className="text-xl font-bold text-gray-800 mb-2">
//                       No tradespeople found
//                     </h3>
//                     <p className="text-gray-600 mb-6">
//                       We couldn't find any tradespeople in your area for this postcode.
//                     </p>
//                     <button
//                       onClick={() => setShowResults(false)}
//                       className="py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition"
//                     >
//                       Try another postcode
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function JobCreationForm() {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [uploadingMedia, setUploadingMedia] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
//   const [uploadedMedia, setUploadedMedia] = useState([]);
//   const [user, setUser] = useState(null);
//   const [isLoadingUser, setIsLoadingUser] = useState(true);
//   const [showTradespersonSearch, setShowTradespersonSearch] = useState(false);

//   const [form, setForm] = useState({
//     category: "",
//     subCategory: "",
//     ownership: "OWNER",
//     description: "",
//     postcode: "",
//     city: "",
//     startTime: "WITHIN_2_WEEKS",
//     jobStage: "PLANNING",
//     budgetMin: "",
//     budgetMax: "",
//     contactName: "",
//     contactPhone: "",
//     contactEmail: "",
//   });

//   // Fetch user data from API
//   const fetchUser = useCallback(async () => {
//     try {
//       setIsLoadingUser(true);
//       const res = await fetch("/api/me", {
//         credentials: "include",
//         cache: "no-store",
//       });
      
//       if (res.ok) {
//         const userData = await res.json();
//         setUser(userData);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       setUser(null);
//     } finally {
//       setIsLoadingUser(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUser();
//   }, [fetchUser]);

//   // Fetch categories on mount (like ref code)
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("/api/categories");
//         const catData = await res.json();
//         setCategories(catData);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // Fetch subcategories dynamically when category changes (like ref code)
//   useEffect(() => {
//     const fetchSubCategories = async () => {
//       if (!form.category) {
//         setFilteredSubCategories([]);
//         return;
//       }

//       try {
//         const res = await fetch(`/api/subcategories?categoryId=${form.category}`);
//         const subData = await res.json();
//         setFilteredSubCategories(subData);
//       } catch (error) {
//         console.error("Error fetching subcategories:", error);
//         setFilteredSubCategories([]);
//       }
//     };
//     fetchSubCategories();
//   }, [form.category]);

//   // Pre-fill contact info from user data
//   useEffect(() => {
//     if (user && !isLoadingUser) {
//       const userName = user.name || user.user?.name || "";
//       const userPhone = user.phone || user.user?.phone || "";
//       const userEmail = user.email || user.user?.email || "";
      
//       if (userEmail) {
//         setForm((prev) => ({
//           ...prev,
//           contactName: userName || prev.contactName,
//           contactPhone: userPhone || prev.contactPhone,
//           contactEmail: userEmail,
//         }));
//       }
//     }
//   }, [user, isLoadingUser]);

//   // File validation function
//   const validateFile = (file) => {
//     const isImage = VALIDATION_RULES.MEDIA.ALLOWED_IMAGE_TYPES.includes(file.type);
//     const isVideo = VALIDATION_RULES.MEDIA.ALLOWED_VIDEO_TYPES.includes(file.type);

//     if (!isImage && !isVideo) {
//       return {
//         valid: false,
//         error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.`
//       };
//     }

//     if (isImage && file.size > VALIDATION_RULES.MEDIA.MAX_IMAGE_SIZE) {
//       return {
//         valid: false,
//         error: `Image ${file.name} is too large. Maximum size is 5MB.`
//       };
//     }

//     if (isVideo && file.size > VALIDATION_RULES.MEDIA.MAX_VIDEO_SIZE) {
//       return {
//         valid: false,
//         error: `Video ${file.name} is too large. Maximum size is 10MB.`
//       };
//     }

//     return { valid: true };
//   };

//   // Budget validation
//   const validateBudget = (min, max) => {
//     const minBudget = Number(min);
//     const maxBudget = Number(max);

//     if (minBudget < VALIDATION_RULES.BUDGET.MIN) {
//       return `Minimum budget must be at least £${VALIDATION_RULES.BUDGET.MIN}`;
//     }

//     if (maxBudget > VALIDATION_RULES.BUDGET.MAX) {
//       return `Maximum budget cannot exceed £${VALIDATION_RULES.BUDGET.MAX.toLocaleString()}`;
//     }

//     if (minBudget >= maxBudget) {
//       return "Maximum budget must be greater than minimum budget";
//     }

//     if (maxBudget - minBudget < 100) {
//       return "Budget range should be at least £100";
//     }

//     return null;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Description length validation
//     if (name === "description" && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
//       toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
//         position: "top-center",
//       });
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     // Check total files limit
//     const totalFiles = uploadedMedia.length + files.length;
//     if (totalFiles > VALIDATION_RULES.MEDIA.MAX_FILES) {
//       toast.error(`You can only upload a maximum of ${VALIDATION_RULES.MEDIA.MAX_FILES} files`, {
//         position: "top-center",
//         duration: 4000,
//       });
//       e.target.value = "";
//       return;
//     }

//     // Validate each file
//     for (const file of files) {
//       const validation = validateFile(file);
//       if (!validation.valid) {
//         toast.error(validation.error, {
//           position: "top-center",
//           duration: 5000,
//         });
//         e.target.value = "";
//         return;
//       }
//     }

//     setUploadingMedia(true);
//     const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`, {
//       position: "top-center",
//     });

//     try {
//       const uploadPromises = files.map(async (file) => {
//         const formData = new FormData();
//         formData.append("file", file);

//         const res = await fetch("/api/upload", {
//           method: "POST",
//           body: formData,
//         });

//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.message || "Upload failed");
//         }
//         return await res.json();
//       });

//       const results = await Promise.all(uploadPromises);
//       setUploadedMedia((prev) => [...prev, ...results]);

//       toast.dismiss(uploadingToast);
//       toast.success(`✅ ${results.length} file(s) uploaded successfully!`, {
//         position: "top-center",
//         duration: 3000,
//       });
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.dismiss(uploadingToast);
//       toast.error(error.message || "Upload failed. Please try again.", {
//         position: "top-center",
//         duration: 4000,
//       });
//     } finally {
//       setUploadingMedia(false);
//       e.target.value = "";
//     }
//   };

//   const removeMedia = (index) => {
//     setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
//     toast.success("File removed", {
//       position: "top-center",
//       duration: 2000,
//     });
//   };

//   const validateCurrentStep = () => {
//     switch (currentStep) {
//       case 1:
//         if (!form.category || !form.subCategory) {
//           toast.error("Please select both category and sub-category", {
//             position: "top-center",
//           });
//           return false;
//         }
//         return true;

//       case 2:
//         if (!form.ownership) {
//           toast.error("Please select ownership status", {
//             position: "top-center",
//           });
//           return false;
//         }
//         return true;

//       case 3:
//         if (form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH) {
//           toast.error(`Description must be at least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters`, {
//             position: "top-center",
//           });
//           return false;
//         }
//         if (form.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
//           toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
//             position: "top-center",
//           });
//           return false;
//         }
//         return true;

//       case 4:
//         if (!form.budgetMin || !form.budgetMax) {
//           toast.error("Please enter both minimum and maximum budget", {
//             position: "top-center",
//           });
//           return false;
//         }
//         const budgetError = validateBudget(form.budgetMin, form.budgetMax);
//         if (budgetError) {
//           toast.error(budgetError, {
//             position: "top-center",
//             duration: 4000,
//           });
//           return false;
//         }
//         return true;

//       case 5:
//         if (!form.postcode) {
//           toast.error("Please enter a postcode", {
//             position: "top-center",
//           });
//           return false;
//         }
//         if (!VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode)) {
//           toast.error("Please enter a valid UK postcode (e.g., SW1A 1AA)", {
//             position: "top-center",
//           });
//           return false;
//         }
//         return true;

//       case 6:
//         if (!form.contactName.trim() || form.contactName.length < 2) {
//           toast.error("Please enter a valid contact name", {
//             position: "top-center",
//           });
//           return false;
//         }
//         if (!form.contactPhone.trim()) {
//           toast.error("Please enter a phone number", {
//             position: "top-center",
//           });
//           return false;
//         }
//         if (!VALIDATION_RULES.PHONE.PATTERN.test(form.contactPhone)) {
//           toast.error("Please enter a valid UK phone number (e.g., 07700 900000)", {
//             position: "top-center",
//             duration: 4000,
//           });
//           return false;
//         }
//         if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
//           toast.error("Please enter a valid email address", {
//             position: "top-center",
//           });
//           return false;
//         }
//         return true;

//       default:
//         return true;
//     }
//   };

//   const nextStep = () => {
//     if (!validateCurrentStep()) {
//       return;
//     }

//     if (currentStep === 1 && form.category && form.subCategory) {
//       setIsOpen(true);
//       setCurrentStep(2);
//     } else {
//       setCurrentStep((prev) => Math.min(prev + 1, 6));
//     }
//   };

//   const prevStep = () => {
//     if (currentStep === 2) {
//       setIsOpen(false);
//       setCurrentStep(1);
//     } else {
//       setCurrentStep((prev) => Math.max(prev - 1, 1));
//     }
//   };

//   // Handle closing modal - show tradesperson search
//   const handleCloseModal = () => {
//     setIsOpen(false);
//     setCurrentStep(1);
//     setShowTradespersonSearch(true);
//   };

//   // Handle return to job from tradesperson search
//   const handleReturnToJob = () => {
//     setShowTradespersonSearch(false);
//     if (form.category && form.subCategory) {
//       setIsOpen(true);
//       setCurrentStep(2);
//     }
//   };

//   // Handle cancel job entirely
//   const handleCancelJob = () => {
//     setShowTradespersonSearch(false);
//     setForm({
//       category: "",
//       subCategory: "",
//       ownership: "OWNER",
//       description: "",
//       postcode: "",
//       city: "",
//       startTime: "WITHIN_2_WEEKS",
//       jobStage: "PLANNING",
//       budgetMin: "",
//       budgetMax: "",
//       contactName: "",
//       contactPhone: "",
//       contactEmail: "",
//     });
//     setUploadedMedia([]);
//     toast.success("Job post cancelled", {
//       position: "top-center",
//       duration: 2000,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (isLoadingUser) {
//       toast.error("Please wait while we verify your account...", {
//         position: "top-center",
//       });
//       return;
//     }

//     // Final validation before submit
//     if (!validateCurrentStep()) {
//       return;
//     }

//     const userEmail = user?.email || user?.user?.email;
//     const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
//     const userRole = user?.role || user?.user?.role;

//     if (!userEmail || !userId) {
//       toast.error("Please log in first to create a job", {
//         position: "top-center",
//         duration: 4000,
//       });
//       setTimeout(() => {
//         router.push("/auth/login");
//       }, 1500);
//       return;
//     }

//     if (userRole !== "HOMEOWNER") {
//       toast.error("Only homeowners can create jobs", {
//         position: "top-center",
//         duration: 4000,
//       });
//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//       return;
//     }

//     const payload = {
//       category: form.category,
//       subCategory: form.subCategory,
//       description: form.description.trim(),
//       location: {
//         postcode: form.postcode.trim().toUpperCase(),
//         city: form.city.trim(),
//       },
//       startTime: form.startTime,
//       jobStage: form.jobStage,
//       ownership: form.ownership,
//       budgetMin: Number(form.budgetMin),
//       budgetMax: Number(form.budgetMax),
//       media: uploadedMedia,
//       contactName: form.contactName.trim(),
//       contactPhone: form.contactPhone.trim(),
//       contactEmail: form.contactEmail.trim().toLowerCase(),
//       userId: userId,
//     };

//     try {
//       setLoading(true);
//       const loadingToast = toast.loading("Creating your job...", {
//         position: "top-center",
//       });

//       const res = await fetch("/api/jobs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       toast.dismiss(loadingToast);

//       if (!res.ok) throw new Error(data.message || "Failed to create job");

//       toast.success("🎉 Job created successfully!", {
//         position: "top-center",
//         duration: 3000,
//       });

//       setForm({
//         category: "",
//         subCategory: "",
//         ownership: "OWNER",
//         description: "",
//         postcode: "",
//         city: "",
//         startTime: "WITHIN_2_WEEKS",
//         jobStage: "PLANNING",
//         budgetMin: "",
//         budgetMax: "",
//         contactName: user?.name || user?.user?.name || "",
//         contactPhone: user?.phone || user?.user?.phone || "",
//         contactEmail: user?.email || user?.user?.email || "",
//       });
//       setUploadedMedia([]);
//       setCurrentStep(1);
//       setIsOpen(false);
//       setShowTradespersonSearch(false);

//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     } catch (err) {
//       console.error("❌ ERROR:", err);
//       toast.error(err.message || "Failed to create job. Please try again.", {
//         position: "top-center",
//         duration: 4000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return form.category && form.subCategory;
//       case 2:
//         return form.ownership;
//       case 3:
//         return form.description.length >= VALIDATION_RULES.DESCRIPTION.MIN_LENGTH && 
//                form.description.length <= VALIDATION_RULES.DESCRIPTION.MAX_LENGTH;
//       case 4:
//         return form.budgetMin && form.budgetMax && 
//                Number(form.budgetMin) >= VALIDATION_RULES.BUDGET.MIN &&
//                Number(form.budgetMax) <= VALIDATION_RULES.BUDGET.MAX &&
//                Number(form.budgetMin) < Number(form.budgetMax);
//       case 5:
//         return form.postcode && VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode);
//       case 6:
//         return form.contactName && form.contactPhone && form.contactEmail &&
//                form.contactName.length >= 2 &&
//                VALIDATION_RULES.PHONE.PATTERN.test(form.contactPhone) &&
//                form.contactEmail.includes('@');
//       default:
//         return false;
//     }
//   };

//   const getDisplayEmail = () => {
//     return user?.email || user?.user?.email || "Not logged in";
//   };

//   const getDisplayName = () => {
//     return user?.name || user?.user?.name || "";
//   };

//   const getDisplayPhone = () => {
//     return user?.phone || user?.user?.phone || "";
//   };

//   const getRemainingCharacters = () => {
//     return VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - form.description.length;
//   };

//   const isUploadDisabled = uploadedMedia.length >= VALIDATION_RULES.MEDIA.MAX_FILES;

//   // If showing tradesperson search, render that instead
//   if (showTradespersonSearch) {
//     return (
//       <>
//         <Toaster />
//         <TradespersonSearch
//           onCancel={handleCancelJob}
//           onReturnToJob={handleReturnToJob}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       <Toaster />

//       {/* Initial Form - Matches ratedpeople.com style */}
//       {!isOpen && currentStep === 1 && (
//         <div className="bg-[#2c2c2c] rounded-lg shadow-2xl max-w-4xl mx-auto p-6 text-left relative z-20">
//           <p className="text-white text-center mb-4 text-base">
//             Post your job for free. Get quotes. Read reviews.
//           </p>
          
//           <div className="flex flex-col md:flex-row gap-4 mb-4">
//             {/* Category Dropdown */}
//             <div className="flex-1">
//               <label className="block text-sm font-bold text-white mb-2">
//                 What service are you looking for?
//               </label>
//               <select
//                 name="category"
//                 value={form.category}
//                 onChange={handleChange}
//                 className="w-full h-[50px] px-4 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] outline-none"
//               >
//                 <option value="">Please select</option>
//                 {categories.map((cat) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* SubCategory Dropdown */}
//             <div className="flex-1">
//               <label className="block text-sm font-bold text-white mb-2">
//                 What type of job is it?
//               </label>
//               <select
//                 name="subCategory"
//                 value={form.subCategory}
//                 onChange={handleChange}
//                 disabled={!form.category}
//                 className="w-full h-[50px] px-4 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
//               >
//                 <option value="">Please select</option>
//                 {filteredSubCategories.map((sub) => (
//                   <option key={sub._id} value={sub._id}>
//                     {sub.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Next Step Button */}
//             <div className="flex items-end">
//               <button
//                 onClick={nextStep}
//                 disabled={!canProceed()}
//                 className="w-full md:w-auto bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-8 rounded-md transition h-[50px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next step &gt;
//               </button>
//             </div>
//           </div>

//           {/* Trustpilot Rating */}
//           <div className="flex items-center justify-center mt-4 text-white text-sm">
//             <span className="mr-2">Great</span>
//             <div className="flex gap-1">
//               {[1,2,3,4].map(i => (
//                 <div key={i} className="w-5 h-5 bg-[#84cc16] flex items-center justify-center text-xs">★</div>
//               ))}
//               <div className="w-5 h-5 bg-gray-400 flex items-center justify-center text-xs">★</div>
//             </div>
//             <span className="ml-2 underline cursor-pointer">19,128 reviews on Trustpilot</span>
//           </div>
//         </div>
//       )}

//       {/* Modal for Steps 2-6 with Blue Theme */}
//       {isOpen && currentStep > 1 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 mt-15">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            
//             {/* Header with Blue Theme */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-[#1149C7] rounded flex items-center justify-center text-white font-bold">
//                   L
//                 </div>
//                 <div>
//                   <span className="font-bold text-lg">Leadsharing</span>
//                   <p className="text-xs text-gray-500">
//                     {isLoadingUser ? "Loading..." : `Logged in as: ${getDisplayEmail()}`}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
//                 title="Cancel and find tradespeople"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Progress Bar - Blue Theme */}
//             <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-gray-700">
//                   Step {currentStep} of 6
//                 </span>
//                 <span className="text-sm text-gray-500">
//                   {currentStep === 6 ? "Final step" : `${6 - currentStep} steps left`}
//                 </span>
//               </div>
//               <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-[#1149C7] transition-all duration-300"
//                   style={{ width: `${(currentStep / 6) * 100}%` }}
//                 />
//               </div>
//             </div>

//             {/* Form Content */}
//             <form onSubmit={handleSubmit}>
//               <div className="p-6">
                
//                 {/* Step 2: Ownership */}
//                 {currentStep === 2 && (
//                   <div className="space-y-6">
//                     <h2 className="text-2xl font-bold text-gray-800">
//                       Are you the owner or authorised to make property changes?
//                     </h2>
//                     <div className="space-y-3">
//                       {[
//                         { value: "OWNER", label: "I own and live at this property" },
//                         { value: "LANDLORD", label: "I am the landlord" },
//                         { value: "AUTHORIZED", label: "I rent, but am authorised to make changes to this property" },
//                         { value: "BUYING", label: "I am looking to buy this property" },
//                       ].map((option) => (
//                         <button
//                           key={option.value}
//                           type="button"
//                           onClick={() => setForm((prev) => ({ ...prev, ownership: option.value }))}
//                           className={`w-full p-4 border-2 rounded-lg text-left transition ${
//                             form.ownership === option.value
//                               ? "border-[#1149C7] bg-blue-50"
//                               : "border-gray-200 hover:border-gray-300"
//                           }`}
//                         >
//                           {option.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 3: Description */}
//                 {currentStep === 3 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Describe what needs to be done
//                       </h2>
//                       <p className={`text-sm ${
//                         form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH 
//                           ? 'text-red-500' 
//                           : form.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - 50
//                           ? 'text-orange-500'
//                           : 'text-gray-500'
//                       }`}>
//                         {form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH 
//                           ? `At least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters required (${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH})`
//                           : `${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters (${getRemainingCharacters()} remaining)`
//                         }
//                       </p>
//                     </div>
//                     <textarea
//                       name="description"
//                       value={form.description}
//                       onChange={handleChange}
//                       rows="6"
//                       className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                       placeholder="Describe the work you need done..."
//                       maxLength={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
//                     />

//                     {/* Media Upload */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Add photos or videos (optional) 
//                         <span className="ml-2 text-gray-400">
//                           ({uploadedMedia.length}/{VALIDATION_RULES.MEDIA.MAX_FILES} files)
//                         </span>
//                       </label>

//                       {isUploadDisabled && (
//                         <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                           <p className="text-sm text-yellow-800">
//                             ⚠️ Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} files allowed. Remove existing files to upload new ones.
//                           </p>
//                         </div>
//                       )}

//                       <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
//                         isUploadDisabled 
//                           ? 'border-gray-200 bg-gray-50' 
//                           : 'border-gray-300 hover:border-[#1149C7]'
//                       }`}>
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
//                           onChange={handleFileUpload}
//                           disabled={uploadingMedia || isUploadDisabled}
//                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
//                         />
//                         {uploadingMedia ? (
//                           <div className="flex flex-col items-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mb-3"></div>
//                             <p className="text-gray-600">Uploading...</p>
//                           </div>
//                         ) : (
//                           <>
//                             <div className="text-gray-400 mb-2">📁</div>
//                             <p className="text-sm text-gray-600 font-medium">
//                               {isUploadDisabled ? 'Maximum files reached' : 'Click to upload or drag and drop'}
//                             </p>
//                             {!isUploadDisabled && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Images (max 5MB) or Videos (max 10MB) • Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} files
//                               </p>
//                             )}
//                           </>
//                         )}
//                       </div>

//                       {uploadedMedia.length > 0 && (
//                         <div className="grid grid-cols-2 gap-3 mt-4">
//                           {uploadedMedia.map((media, index) => (
//                             <div key={index} className="relative group">
//                               {media.type === "IMAGE" ? (
//                                 <img
//                                   src={media.url}
//                                   alt={`Uploaded ${index + 1}`}
//                                   className="w-full h-24 object-cover rounded-lg border border-gray-200"
//                                 />
//                               ) : (
//                                 <video
//                                   src={media.url}
//                                   className="w-full h-24 object-cover rounded-lg border border-gray-200"
//                                 />
//                               )}
//                               <button
//                                 type="button"
//                                 onClick={() => removeMedia(index)}
//                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
//                                 title="Remove file"
//                               >
//                                 ×
//                               </button>
//                               <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
//                                 {media.type}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 4: Budget */}
//                 {currentStep === 4 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Roughly, what's your budget?
//                       </h2>
//                       <p className="text-sm text-gray-500">
//                         You're not committing to anything here. It's just a guide.
//                       </p>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Minimum Budget (£)
//                         </label>
//                         <input
//                           type="number"
//                           name="budgetMin"
//                           value={form.budgetMin}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                           placeholder="500"
//                           min={VALIDATION_RULES.BUDGET.MIN}
//                           max={VALIDATION_RULES.BUDGET.MAX}
//                         />
//                         <p className="mt-1 text-xs text-gray-500">
//                           Minimum: £{VALIDATION_RULES.BUDGET.MIN}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Maximum Budget (£)
//                         </label>
//                         <input
//                           type="number"
//                           name="budgetMax"
//                           value={form.budgetMax}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                           placeholder="1000"
//                           min={VALIDATION_RULES.BUDGET.MIN}
//                           max={VALIDATION_RULES.BUDGET.MAX}
//                         />
//                         <p className="mt-1 text-xs text-gray-500">
//                           Maximum: £{VALIDATION_RULES.BUDGET.MAX.toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                     {form.budgetMin && form.budgetMax && (
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                         <p className="text-sm text-gray-700">
//                           Budget range: <span className="font-semibold text-[#1149C7]">£{Number(form.budgetMin).toLocaleString()} - £{Number(form.budgetMax).toLocaleString()}</span>
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Step 5: Location & Timeline */}
//                 {currentStep === 5 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Job details
//                       </h2>
//                       <p className="text-sm text-gray-500">
//                         Provide additional information about when you need the work done and where it will take place.
//                       </p>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Where will the job take place? *
//                       </label>
//                       <input
//                         type="text"
//                         name="postcode"
//                         value={form.postcode}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition uppercase"
//                         placeholder="SW1A 1AA"
//                         pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
//                       />
//                       <p className="mt-1 text-xs text-gray-500">
//                         UK postcode format (e.g., SW1A 1AA)
//                       </p>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         City (optional)
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={form.city}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                         placeholder="London"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         When do you need the work done? *
//                       </label>
//                       <select
//                         name="startTime"
//                         value={form.startTime}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                       >
//                         <option value="URGENT">Urgent</option>
//                         <option value="WITHIN_2_DAYS">Within 2 Days</option>
//                         <option value="WITHIN_2_WEEKS">Within 2 Weeks</option>
//                         <option value="WITHIN_2_MONTHS">Within 2 Months</option>
//                         <option value="FLEXIBLE">Flexible</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         What stage is your project at? *
//                       </label>
//                       <select
//                         name="jobStage"
//                         value={form.jobStage}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                       >
//                         <option value="READY_TO_HIRE">Ready to hire</option>
//                         <option value="PLANNING">Planning</option>
//                         <option value="INSURANCE_WORK">Insurance work</option>
//                       </select>
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 6: Contact Information */}
//                 {currentStep === 6 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Contact Information
//                       </h2>
//                       <p className="text-sm text-gray-500">
//                         This information will be shared with tradespeople when they unlock your job.
//                       </p>
//                       {user && getDisplayEmail() !== "Not logged in" && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mt-3">
//                           <p className="text-sm text-blue-800">
//                             <span className="font-semibold">Note:</span> Your contact information has been pre-filled from your account.
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Full Name *
//                       </label>
//                       <input
//                         type="text"
//                         name="contactName"
//                         value={form.contactName}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                         placeholder="John Doe"
//                         required
//                         minLength={2}
//                       />
//                       {getDisplayName() && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Pre-filled from your account: {getDisplayName()}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone Number *
//                       </label>
//                       <input
//                         type="tel"
//                         name="contactPhone"
//                         value={form.contactPhone}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                         placeholder="07700 900000"
//                         required
//                         pattern="^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$"
//                       />
//                       <p className="mt-1 text-xs text-gray-500">
//                         UK mobile format (e.g., 07700 900000)
//                       </p>
//                       {getDisplayPhone() && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Pre-filled: {getDisplayPhone()}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Email Address *
//                       </label>
//                       <input
//                         type="email"
//                         name="contactEmail"
//                         value={form.contactEmail}
//                         onChange={handleChange}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
//                         placeholder="john@example.com"
//                         required
//                       />
//                       {getDisplayEmail() !== "Not logged in" && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Pre-filled from your account: {getDisplayEmail()}
//                         </p>
//                       )}
//                     </div>

//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                       <p className="text-sm text-blue-800">
//                         <span className="font-semibold">💡 Note:</span> Your contact information will only be visible to tradespeople who purchase your job lead.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Navigation Buttons - Blue Theme */}
//               <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-4">
//                 {currentStep > 1 && (
//                   <button
//                     type="button"
//                     onClick={prevStep}
//                     className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
//                   >
//                     Back
//                   </button>
//                 )}
//                 {currentStep < 6 ? (
//                   <button
//                     type="button"
//                     onClick={nextStep}
//                     disabled={!canProceed()}
//                     className="flex-1 py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next step →
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     disabled={!canProceed() || loading}
//                     className="flex-1 py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {loading ? "Creating..." : "Submit Job"}
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

// Validation Constants
const VALIDATION_RULES = {
  MEDIA: {
    MAX_FILES: 2,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  },
  DESCRIPTION: {
    MIN_LENGTH: 25,
    MAX_LENGTH: 100,
  },
  BUDGET: {
    MIN: 50,
    MAX: 100000,
  },
  PHONE: {
    PATTERN: /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
  },
  POSTCODE: {
    PATTERN: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  }
};

// Tradesperson Search Component - FIXED
function TradespersonSearch({ onCancel, onReturnToJob }) {
  const [postcode, setPostcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [tradespeople, setTradespeople] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!postcode.trim()) {
      toast.error("Please enter a postcode", {
        position: "top-center",
      });
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
      const response = await fetch(`/api/tradesperson/search?postcode=${encodeURIComponent(postcode)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      setTradespeople(data.data || []);
      setShowResults(true);

      if (data.count === 0) {
        toast.info("No tradespeople found in your area", {
          position: "top-center",
        });
      } else {
        toast.success(`Found ${data.count} tradespeople in your area`, {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to search tradespeople", {
        position: "top-center",
      });
      setTradespeople([]);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  };

  const handleCallNow = (phoneNumber) => {
    // Actually call the number
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleViewProfile = (profileId) => {
    router.push(`/tradespeople/${profileId}`);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">rated people</h1>
            <p className="text-gray-600">
              Find trusted tradespeople in your area
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Search Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Prefer to make a call?
                </h2>
<<<<<<< HEAD
                <p className="text-gray-600 mb-6 text-sm">
                  Get a list of local tradespeople you can contact directly.
                </p>
=======

                <div className="space-y-3">
                  {[
                    { label: "Urgent", value: "URGENT" },
                    { label: "Within 2 weeks", value: "WITHIN_2_WEEKS" },
                    { label: "Within 2 months", value: "WITHIN_2_MONTHS" },
                    { label: "2 months+", value: "FLEXIBLE" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer"
                    >
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                      <span className="text-gray-700">{option.label}</span>
                    </div>
                  ))}
                </div>
>>>>>>> 697eafe66c5800c095b84cb23e7d121b9d841a17

                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your postcode
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="SW1A 1AA"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition uppercase"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      UK postcode format (e.g., SW1A 1AA)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={searching}
                    className="w-full bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Searching...
                      </span>
                    ) : (
                      "Yes, show me tradespeople"
                    )}
                  </button>
                </form>

                {/* Navigation Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <button
                    onClick={onReturnToJob}
                    className="w-full py-3 border-2 border-[#1149C7] text-[#1149C7] rounded-lg font-medium hover:bg-blue-50 transition"
                  >
                    Return to job post
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    No, cancel job post
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2">
              {!showResults ? (
                // Initial state
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
                // Search Results
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Tradespeople in {postcode}
                      </h2>
                      <p className="text-gray-600">
                        {tradespeople.length} {tradespeople.length === 1 ? 'result' : 'results'} found
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowResults(false);
                        setPostcode("");
                      }}
                      className="text-[#1149C7] hover:text-[#0d38a0] font-medium"
                    >
                      ← Back to search
                    </button>
                  </div>

                  {tradespeople.length > 0 ? (
                    <div className="space-y-6">
                      {tradespeople.map((trade, index) => (
                        <div key={trade._id || index} className="border-2 border-gray-200 hover:border-[#1149C7] rounded-xl overflow-hidden hover:shadow-lg transition">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
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

                              {/* Company Info */}
                              <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {trade.companyName}
                                </h3>
                                
                                {/* Ratings */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span 
                                        key={i} 
                                        className={`text-sm ${
                                          i < Math.round(trade.average_rating || 0) 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-300'
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {(trade.average_rating || 0).toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    ({trade.total_ratings || 0} {trade.total_ratings === 1 ? 'rating' : 'ratings'})
                                  </span>
                                </div>

                                {/* Bio */}
                                {trade.bio && (
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                    {trade.bio}
                                  </p>
                                )}

                                {/* Skills */}
                                {trade.skills && trade.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {trade.skills.slice(0, 3).map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
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

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 md:w-48">
                                <button
                                  onClick={() => handleViewProfile(trade._id)}
                                  className="w-full py-2 px-4 border-2 border-[#1149C7] text-[#1149C7] rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                                >
                                  View profile
                                </button>
                                {trade.phone && (
                                  <button
                                    onClick={() => handleCallNow(trade.phone)}
                                    className="w-full py-2 px-4 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition text-sm flex items-center justify-center gap-2"
                                  >
                                    📞 Call now
                                  </button>
                                )}
                              </div>
                            </div>
<<<<<<< HEAD
=======

                            {/* Company Info */}
                            <div className="flex-grow">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {trade.companyName}
                              </h3>

                              {/* Ratings */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className="text-yellow-400">★</div>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {trade.ratingCount || 27} ratings
                                </span>
                              </div>

                              {/* Bio */}
                              {trade.bio && (
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {trade.bio}
                                </p>
                              )}

                              {/* Skills */}
                              {trade.skills && trade.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {trade.skills.slice(0, 3).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
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

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 min-w-[150px]">
                              <button
                                onClick={() => handleViewProfile(trade._id)}
                                className="py-2 px-4 border-2 border-[#1149C7] text-[#1149C7] rounded-lg font-medium hover:bg-blue-50 transition text-sm"
                              >
                                View profile
                              </button>
                              {trade.phone && (
                                <button
                                  onClick={() => handleCallNow(trade.phone)}
                                  className="py-2 px-4 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition text-sm"
                                >
                                  Call now
                                </button>
                              )}
                            </div>
>>>>>>> 697eafe66c5800c095b84cb23e7d121b9d841a17
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
                          setShowResults(false);
                          setPostcode("");
                        }}
                        className="py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition"
                      >
                        Try another postcode
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function JobCreationForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showTradespersonSearch, setShowTradespersonSearch] = useState(false);

  const [form, setForm] = useState({
    category: "",
    subCategory: "",
    ownership: "OWNER",
    description: "",
    postcode: "",
    city: "",
    startTime: "WITHIN_2_WEEKS",
    jobStage: "PLANNING",
    budgetMin: "",
    budgetMax: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  // Fetch user data from API
  const fetchUser = useCallback(async () => {
    try {
      setIsLoadingUser(true);
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const catData = await res.json();
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories dynamically when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!form.category) {
        setFilteredSubCategories([]);
        return;
      }

      try {
        const res = await fetch(`/api/subcategories?categoryId=${form.category}`);
        const subData = await res.json();
        setFilteredSubCategories(subData);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setFilteredSubCategories([]);
      }
    };
    fetchSubCategories();
  }, [form.category]);

  // Pre-fill contact info from user data
  useEffect(() => {
    if (user && !isLoadingUser) {
      const userName = user.name || user.user?.name || "";
      const userPhone = user.phone || user.user?.phone || "";
      const userEmail = user.email || user.user?.email || "";

      if (userEmail) {
        setForm((prev) => ({
          ...prev,
          contactName: userName || prev.contactName,
          contactPhone: userPhone || prev.contactPhone,
          contactEmail: userEmail,
        }));
      }
    }
  }, [user, isLoadingUser]);

  // File validation function
  const validateFile = (file) => {
    const isImage = VALIDATION_RULES.MEDIA.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = VALIDATION_RULES.MEDIA.ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return {
        valid: false,
        error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.`
      };
    }

    if (isImage && file.size > VALIDATION_RULES.MEDIA.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image ${file.name} is too large. Maximum size is 5MB.`
      };
    }

    if (isVideo && file.size > VALIDATION_RULES.MEDIA.MAX_VIDEO_SIZE) {
      return {
        valid: false,
        error: `Video ${file.name} is too large. Maximum size is 10MB.`
      };
    }

    return { valid: true };
  };

  // Budget validation
  const validateBudget = (min, max) => {
    const minBudget = Number(min);
    const maxBudget = Number(max);

    if (minBudget < VALIDATION_RULES.BUDGET.MIN) {
      return `Minimum budget must be at least £${VALIDATION_RULES.BUDGET.MIN}`;
    }

    if (maxBudget > VALIDATION_RULES.BUDGET.MAX) {
      return `Maximum budget cannot exceed £${VALIDATION_RULES.BUDGET.MAX.toLocaleString()}`;
    }

    if (minBudget >= maxBudget) {
      return "Maximum budget must be greater than minimum budget";
    }

    if (maxBudget - minBudget < 100) {
      return "Budget range should be at least £100";
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Description length validation
    if (name === "description" && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
      toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
        position: "top-center",
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check total files limit
    const totalFiles = uploadedMedia.length + files.length;
    if (totalFiles > VALIDATION_RULES.MEDIA.MAX_FILES) {
      toast.error(`You can only upload a maximum of ${VALIDATION_RULES.MEDIA.MAX_FILES} files`, {
        position: "top-center",
        duration: 4000,
      });
      e.target.value = "";
      return;
    }

    // Validate each file
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error, {
          position: "top-center",
          duration: 5000,
        });
        e.target.value = "";
        return;
      }
    }

    setUploadingMedia(true);
    const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`, {
      position: "top-center",
    });

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Upload failed");
        }
        return await res.json();
      });

      const results = await Promise.all(uploadPromises);
      setUploadedMedia((prev) => [...prev, ...results]);

      toast.dismiss(uploadingToast);
      toast.success(`✅ ${results.length} file(s) uploaded successfully!`, {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(uploadingToast);
      toast.error(error.message || "Upload failed. Please try again.", {
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeMedia = (index) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
    toast.success("File removed", {
      position: "top-center",
      duration: 2000,
    });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!form.category || !form.subCategory) {
          toast.error("Please select both category and sub-category", {
            position: "top-center",
          });
          return false;
        }
        return true;

      case 2:
        if (!form.ownership) {
          toast.error("Please select ownership status", {
            position: "top-center",
          });
          return false;
        }
        return true;

      case 3:
        if (form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH) {
          toast.error(`Description must be at least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters`, {
            position: "top-center",
          });
          return false;
        }
        if (form.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
          toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
            position: "top-center",
          });
          return false;
        }
        return true;

      case 4:
        if (!form.budgetMin || !form.budgetMax) {
          toast.error("Please enter both minimum and maximum budget", {
            position: "top-center",
          });
          return false;
        }
        const budgetError = validateBudget(form.budgetMin, form.budgetMax);
        if (budgetError) {
          toast.error(budgetError, {
            position: "top-center",
            duration: 4000,
          });
          return false;
        }
        return true;

      case 5:
        if (!form.postcode) {
          toast.error("Please enter a postcode", {
            position: "top-center",
          });
          return false;
        }
        if (!VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode)) {
          toast.error("Please enter a valid UK postcode (e.g., SW1A 1AA)", {
            position: "top-center",
          });
          return false;
        }
        return true;

      case 6:
        if (!form.contactName.trim() || form.contactName.length < 2) {
          toast.error("Please enter a valid contact name", {
            position: "top-center",
          });
          return false;
        }
        if (!form.contactPhone.trim()) {
          toast.error("Please enter a phone number", {
            position: "top-center",
          });
          return false;
        }
        if (!VALIDATION_RULES.PHONE.PATTERN.test(form.contactPhone)) {
          toast.error("Please enter a valid UK phone number (e.g., 07700 900000)", {
            position: "top-center",
            duration: 4000,
          });
          return false;
        }
        if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
          toast.error("Please enter a valid email address", {
            position: "top-center",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 1 && form.category && form.subCategory) {
      setIsOpen(true);
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setIsOpen(false);
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // Handle closing modal - show tradesperson search
  const handleCloseModal = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setShowTradespersonSearch(true);
  };

  // Handle return to job from tradesperson search
  const handleReturnToJob = () => {
    setShowTradespersonSearch(false);
    if (form.category && form.subCategory) {
      setIsOpen(true);
      setCurrentStep(2);
    }
  };

  // Handle cancel job entirely
  const handleCancelJob = () => {
    setShowTradespersonSearch(false);
    setForm({
      category: "",
      subCategory: "",
      ownership: "OWNER",
      description: "",
      postcode: "",
      city: "",
      startTime: "WITHIN_2_WEEKS",
      jobStage: "PLANNING",
      budgetMin: "",
      budgetMax: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    });
    setUploadedMedia([]);
    setIsOpen(false);
    setCurrentStep(1);
    toast.success("Job post cancelled", {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoadingUser) {
      toast.error("Please wait while we verify your account...", {
        position: "top-center",
      });
      return;
    }

    // Final validation before submit
    if (!validateCurrentStep()) {
      return;
    }

    const userEmail = user?.email || user?.user?.email;
    const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
    const userRole = user?.role || user?.user?.role;

    if (!userEmail || !userId) {
      toast.error("Please log in first to create a job", {
        position: "top-center",
        duration: 4000,
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    if (userRole !== "HOMEOWNER") {
      toast.error("Only homeowners can create jobs", {
        position: "top-center",
        duration: 4000,
      });
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    const payload = {
      category: form.category,
      subCategory: form.subCategory,
      description: form.description.trim(),
      location: {
        postcode: form.postcode.trim().toUpperCase(),
        city: form.city.trim(),
      },
      startTime: form.startTime,
      jobStage: form.jobStage,
      ownership: form.ownership,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      media: uploadedMedia,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      userId: userId,
    };

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating your job...", {
        position: "top-center",
      });

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error(data.message || "Failed to create job");

      toast.success("🎉 Job created successfully!", {
        position: "top-center",
        duration: 3000,
      });

      setForm({
        category: "",
        subCategory: "",
        ownership: "OWNER",
        description: "",
        postcode: "",
        city: "",
        startTime: "WITHIN_2_WEEKS",
        jobStage: "PLANNING",
        budgetMin: "",
        budgetMax: "",
        contactName: user?.name || user?.user?.name || "",
        contactPhone: user?.phone || user?.user?.phone || "",
        contactEmail: user?.email || user?.user?.email || "",
      });
      setUploadedMedia([]);
      setCurrentStep(1);
      setIsOpen(false);
      setShowTradespersonSearch(false);

      setTimeout(() => {
        router.push("/homeowner");
      }, 2000);
    } catch (err) {
      console.error("❌ ERROR:", err);
      toast.error(err.message || "Failed to create job. Please try again.", {
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.category && form.subCategory;
      case 2:
        return form.ownership;
      case 3:
        return form.description.length >= VALIDATION_RULES.DESCRIPTION.MIN_LENGTH &&
          form.description.length <= VALIDATION_RULES.DESCRIPTION.MAX_LENGTH;
      case 4:
        return form.budgetMin && form.budgetMax &&
          Number(form.budgetMin) >= VALIDATION_RULES.BUDGET.MIN &&
          Number(form.budgetMax) <= VALIDATION_RULES.BUDGET.MAX &&
          Number(form.budgetMin) < Number(form.budgetMax);
      case 5:
        return form.postcode && VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode);
      case 6:
        return form.contactName && form.contactPhone && form.contactEmail &&
          form.contactName.length >= 2 &&
          VALIDATION_RULES.PHONE.PATTERN.test(form.contactPhone) &&
          form.contactEmail.includes('@');
      default:
        return false;
    }
  };

  const getDisplayEmail = () => {
    return user?.email || user?.user?.email || "Not logged in";
  };

  const getDisplayName = () => {
    return user?.name || user?.user?.name || "";
  };

  const getDisplayPhone = () => {
    return user?.phone || user?.user?.phone || "";
  };

  const getRemainingCharacters = () => {
    return VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - form.description.length;
  };

  const isUploadDisabled = uploadedMedia.length >= VALIDATION_RULES.MEDIA.MAX_FILES;

  // If showing tradesperson search, render that instead
  if (showTradespersonSearch) {
    return (
      <TradespersonSearch
        onCancel={handleCancelJob}
        onReturnToJob={handleReturnToJob}
      />
    );
  }

  return (
    <>
      <Toaster />

      {/* Initial Form - Matches ratedpeople.com style */}
      {!isOpen && currentStep === 1 && (
        <div className="bg-[#2c2c2c] rounded-lg shadow-2xl max-w-4xl mx-auto p-4 sm:p-6 text-left relative z-20">
          <p className="text-white text-center mb-4 text-base">
            Post your job for free. Get quotes. Read reviews.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Category Dropdown */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-white mb-2">
                What service are you looking for?
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-[50px] px-4 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] outline-none"
              >
                <option value="">Please select</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SubCategory Dropdown */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-white mb-2">
                What type of job is it?
              </label>
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                disabled={!form.category}
                className="w-full h-[50px] px-4 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Please select</option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Step Button */}
            <div className="flex items-center md:items-end w-full md:w-auto">
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="w-full md:w-auto bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-8 rounded-md transition h-[50px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next step &gt;
              </button>
            </div>
          </div>

          {/* Trustpilot Rating */}
          <div className="flex items-center justify-center mt-4 text-white text-sm">
            <span className="mr-2">Great</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-5 h-5 bg-[#84cc16] flex items-center justify-center text-xs">★</div>
              ))}
              <div className="w-5 h-5 bg-gray-400 flex items-center justify-center text-xs">★</div>
            </div>
            <span className="ml-2 underline cursor-pointer">19,128 reviews on Trustpilot</span>
          </div>
        </div>
      )}

      {/* Modal for Steps 2-6 with Blue Theme */}
      {isOpen && currentStep > 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Header with Blue Theme */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1149C7] rounded flex items-center justify-center text-white font-bold">
                  L
                </div>
                <div>
                  <span className="font-bold text-lg">Leadsharing</span>
                  <p className="text-xs text-gray-500">
                    {isLoadingUser ? "Loading..." : `Logged in as: ${getDisplayEmail()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                title="Cancel and find tradespeople"
              >
                ×
              </button>
            </div>

            {/* Progress Bar - Blue Theme */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 6
                </span>
                <span className="text-sm text-gray-500">
                  {currentStep === 6 ? "Final step" : `${6 - currentStep} steps left`}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1149C7] transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">

                {/* Step 2: Ownership */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Are you the owner or authorised to make property changes?
                    </h2>
                    <div className="space-y-3">
                      {[
                        { value: "OWNER", label: "I own and live at this property" },
                        { value: "LANDLORD", label: "I am the landlord" },
                        { value: "AUTHORIZED", label: "I rent, but am authorised to make changes to this property" },
                        { value: "BUYING", label: "I am looking to buy this property" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, ownership: option.value }))}
                          className={`w-full p-4 border-2 rounded-lg text-left transition ${form.ownership === option.value
                              ? "border-[#1149C7] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Description */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Describe what needs to be done
                      </h2>
                      <p className={`text-sm ${form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
                          ? 'text-red-500'
                          : form.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - 50
                            ? 'text-orange-500'
                            : 'text-gray-500'
                        }`}>
                        {form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
                          ? `At least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters required (${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH})`
                          : `${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters (${getRemainingCharacters()} remaining)`
                        }
                      </p>
                    </div>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="6"
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                      placeholder="Describe the work you need done..."
                      maxLength={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
                    />

                    {/* Media Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add photos or videos (optional)
                        <span className="ml-2 text-gray-400">
                          ({uploadedMedia.length}/{VALIDATION_RULES.MEDIA.MAX_FILES} files)
                        </span>
                      </label>

                      {isUploadDisabled && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} files allowed. Remove existing files to upload new ones.
                          </p>
                        </div>
                      )}

                      <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${isUploadDisabled
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-300 hover:border-[#1149C7]'
                        }`}>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                          onChange={handleFileUpload}
                          disabled={uploadingMedia || isUploadDisabled}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {uploadingMedia ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mb-3"></div>
                            <p className="text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-gray-400 mb-2">📁</div>
                            <p className="text-sm text-gray-600 font-medium">
                              {isUploadDisabled ? 'Maximum files reached' : 'Click to upload or drag and drop'}
                            </p>
                            {!isUploadDisabled && (
                              <p className="text-xs text-gray-500 mt-1">
                                Images (max 5MB) or Videos (max 10MB) • Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} files
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {uploadedMedia.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {uploadedMedia.map((media, index) => (
                            <div key={index} className="relative group">
                              {media.type === "IMAGE" ? (
                                <img
                                  src={media.url}
                                  alt={`Uploaded ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                                title="Remove file"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {media.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Budget */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Roughly, what's your budget?
                      </h2>
                      <p className="text-sm text-gray-500">
                        You're not committing to anything here. It's just a guide.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Budget (£)
                        </label>
                        <input
                          type="number"
                          name="budgetMin"
                          value={form.budgetMin}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                          placeholder="500"
                          min={VALIDATION_RULES.BUDGET.MIN}
                          max={VALIDATION_RULES.BUDGET.MAX}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Minimum: £{VALIDATION_RULES.BUDGET.MIN}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Budget (£)
                        </label>
                        <input
                          type="number"
                          name="budgetMax"
                          value={form.budgetMax}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                          placeholder="1000"
                          min={VALIDATION_RULES.BUDGET.MIN}
                          max={VALIDATION_RULES.BUDGET.MAX}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum: £{VALIDATION_RULES.BUDGET.MAX.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {form.budgetMin && form.budgetMax && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          Budget range: <span className="font-semibold text-[#1149C7]">£{Number(form.budgetMin).toLocaleString()} - £{Number(form.budgetMax).toLocaleString()}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Location & Timeline */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Job details
                      </h2>
                      <p className="text-sm text-gray-500">
                        Provide additional information about when you need the work done and where it will take place.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Where will the job take place? *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={form.postcode}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition uppercase"
                        placeholder="SW1A 1AA"
                        pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        UK postcode format (e.g., SW1A 1AA)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City (optional)
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        When do you need the work done? *
                      </label>
                      <select
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                      >
                        <option value="URGENT">Urgent</option>
                        <option value="WITHIN_2_DAYS">Within 2 Days</option>
                        <option value="WITHIN_2_WEEKS">Within 2 Weeks</option>
                        <option value="WITHIN_2_MONTHS">Within 2 Months</option>
                        <option value="FLEXIBLE">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What stage is your project at? *
                      </label>
                      <select
                        name="jobStage"
                        value={form.jobStage}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                      >
                        <option value="READY_TO_HIRE">Ready to hire</option>
                        <option value="PLANNING">Planning</option>
                        <option value="INSURANCE_WORK">Insurance work</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 6: Contact Information */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Contact Information
                      </h2>
                      <p className="text-sm text-gray-500">
                        This information will be shared with tradespeople when they unlock your job.
                      </p>
                      {user && getDisplayEmail() !== "Not logged in" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mt-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Note:</span> Your contact information has been pre-filled from your account.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={form.contactName}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="John Doe"
                        required
                        minLength={2}
                      />
                      {getDisplayName() && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pre-filled from your account: {getDisplayName()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="07700 900000"
                        required
                        pattern="^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        UK mobile format (e.g., 07700 900000)
                      </p>
                      {getDisplayPhone() && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pre-filled: {getDisplayPhone()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="john@example.com"
                        required
                      />
                      {getDisplayEmail() !== "Not logged in" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pre-filled from your account: {getDisplayEmail()}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">💡 Note:</span> Your contact information will only be visible to tradespeople who purchase your job lead.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Blue Theme */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                )}
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="flex-1 py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canProceed() || loading}
                    className="flex-1 py-3 px-6 bg-[#1149C7] text-white rounded-lg font-medium hover:bg-[#0d38a0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Submit Job"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}















