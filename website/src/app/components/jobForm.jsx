// // "use client";
// // import { useState, useEffect, useCallback } from "react";
// // import { useRouter } from "next/navigation";
// // import { toast, Toaster } from "react-hot-toast";

// // export default function JobCreationForm() {
// //   const router = useRouter();
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [currentStep, setCurrentStep] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const [uploadingMedia, setUploadingMedia] = useState(false);
// //   const [categories, setCategories] = useState([]);
// //   const [subCategories, setSubCategories] = useState([]);
// //   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
// //   const [uploadedMedia, setUploadedMedia] = useState([]);
// //   const [user, setUser] = useState(null);
// //   const [isLoadingUser, setIsLoadingUser] = useState(true);

// //   const [form, setForm] = useState({
// //     category: "",
// //     subCategory: "",
// //     ownership: "OWNER",
// //     description: "",
// //     postcode: "",
// //     city: "",
// //     startTime: "WITHIN_2_WEEKS",
// //     jobStage: "PLANNING",
// //     budgetMin: "",
// //     budgetMax: "",
// //     contactName: "",
// //     contactPhone: "",
// //     contactEmail: "",
// //   });

// //   // Fetch user data from API - useCallback to prevent infinite re-renders
// //   const fetchUser = useCallback(async () => {
// //     try {
// //       setIsLoadingUser(true);
// //       console.log("Fetching user from /api/me");
// //       const res = await fetch("/api/me", {
// //         credentials: "include",
// //         cache: "no-store",
// //       });
      
// //       console.log("User fetch response status:", res.status);
      
// //       if (res.ok) {
// //         const userData = await res.json();
// //         console.log("User Data fetched:", userData);
// //         setUser(userData);
// //       } else {
// //         console.log("User not authenticated, status:", res.status);
// //         setUser(null);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching user:", error);
// //       setUser(null);
// //     } finally {
// //       setIsLoadingUser(false);
// //     }
// //   }, []);

// //   // Fetch user on mount
// //   useEffect(() => {
// //     fetchUser();
// //   }, [fetchUser]);

// //   // Fetch categories and subcategories on mount
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const [catRes, subRes] = await Promise.all([
// //           fetch("/api/categories"),
// //           fetch("/api/subcategories"),
// //         ]);
// //         const catData = await catRes.json();
// //         const subData = await subRes.json();
// //         setCategories(catData);
// //         setSubCategories(subData);
// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   // Pre-fill contact info from user data - IMPROVED VERSION
// //   useEffect(() => {
// //     console.log("User in pre-fill effect:", user);
    
// //     if (user && !isLoadingUser) {
// //       // More flexible user data extraction
// //       const userName = user.name || user.user?.name || "";
// //       const userPhone = user.phone || user.user?.phone || "";
// //       const userEmail = user.email || user.user?.email || "";
      
// //       console.log("Extracted user data:", {
// //         name: userName,
// //         phone: userPhone,
// //         email: userEmail
// //       });

// //       // Only update if we have at least email (most critical field)
// //       if (userEmail) {
// //         setForm((prev) => ({
// //           ...prev,
// //           contactName: userName || prev.contactName,
// //           contactPhone: userPhone || prev.contactPhone,
// //           contactEmail: userEmail,
// //         }));
// //         console.log("Form updated with user data");
// //       } else {
// //         console.warn("No email found in user object:", user);
// //       }
// //     }
// //   }, [user, isLoadingUser]);

// //   // Filter subcategories based on selected category
// //   useEffect(() => {
// //     if (form.category) {
// //       const filtered = subCategories.filter(
// //         (sub) => sub.category._id === form.category || sub.category === form.category
// //       );
// //       setFilteredSubCategories(filtered);
// //     } else {
// //       setFilteredSubCategories([]);
// //     }
// //   }, [form.category, subCategories]);

// //   const handleChange = (e) => {
// //     setForm((prev) => ({
// //       ...prev,
// //       [e.target.name]: e.target.value,
// //     }));
// //   };

// //   const handleFileUpload = async (e) => {
// //     const files = Array.from(e.target.files);
// //     if (files.length === 0) return;

// //     setUploadingMedia(true);
// //     const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`, {
// //       position: "top-center",
// //       style: {
// //         padding: "16px",
// //         borderRadius: "10px",
// //         fontSize: "16px",
// //       },
// //     });

// //     try {
// //       const uploadPromises = files.map(async (file) => {
// //         const formData = new FormData();
// //         formData.append("file", file);

// //         const res = await fetch("/api/upload", {
// //           method: "POST",
// //           body: formData,
// //         });

// //         if (!res.ok) {
// //           throw new Error("Upload failed");
// //         }
// //         return await res.json();
// //       });

// //       const results = await Promise.all(uploadPromises);
// //       setUploadedMedia((prev) => [...prev, ...results]);

// //       toast.dismiss(uploadingToast);
// //       toast.success(`✅ ${results.length} file(s) uploaded successfully!`, {
// //         duration: 3000,
// //         position: "top-center",
// //         style: {
// //           background: "#10B981",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "📁",
// //       });
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       toast.dismiss(uploadingToast);
// //       toast.error("Upload failed. Please try again.", {
// //         duration: 4000,
// //         position: "top-center",
// //         style: {
// //           background: "#EF4444",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "❌",
// //       });
// //     } finally {
// //       setUploadingMedia(false);
// //     }
// //   };

// //   const removeMedia = (index) => {
// //     setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   const nextStep = () => {
// //     if (currentStep === 1 && form.category && form.subCategory) {
// //       setIsOpen(true);
// //       setCurrentStep(2);
// //     } else {
// //       setCurrentStep((prev) => Math.min(prev + 1, 6));
// //     }
// //   };

// //   const prevStep = () => {
// //     if (currentStep === 2) {
// //       setIsOpen(false);
// //       setCurrentStep(1);
// //     } else {
// //       setCurrentStep((prev) => Math.max(prev - 1, 1));
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     console.log("🔥 SUBMIT CLICKED");
// //     console.log("👤 Current user state:", user);

// //     // Check if user data is still loading
// //     if (isLoadingUser) {
// //       toast.error("Please wait while we verify your account...", {
// //         duration: 4000,
// //         position: "top-center",
// //         style: {
// //           background: "#EF4444",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "⏳",
// //       });
// //       return;
// //     }

// //     // IMPROVED: More flexible user check
// //     const userEmail = user?.email || user?.user?.email;
// //     const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
// //     const userRole = user?.role || user?.user?.role;

// //     console.log("Extracted user details:", {
// //       email: userEmail,
// //       id: userId,
// //       role: userRole
// //     });

// //     // Check if user is logged in - IMPROVED CHECK
// //     if (!userEmail || !userId) {
// //       console.log("User not found, redirecting to login");
// //       toast.error("Please log in first to create a job", {
// //         duration: 4000,
// //         position: "top-center",
// //         style: {
// //           background: "#EF4444",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "🔒",
// //       });
// //       // Redirect to login page after 1.5 seconds
// //       setTimeout(() => {
// //         router.push("/auth/login");
// //       }, 1500);
// //       return;
// //     }

// //     // Check if user role is HOMEOWNER
// //     if (userRole !== "HOMEOWNER") {
// //       toast.error("Only homeowners can create jobs", {
// //         duration: 4000,
// //         position: "top-center",
// //         style: {
// //           background: "#EF4444",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "⚠️",
// //       });
// //       // Redirect to home page after 2 seconds
// //       setTimeout(() => {
// //         router.push("/");
// //       }, 2000);
// //       return;
// //     }

// //     const payload = {
// //       category: form.category,
// //       subCategory: form.subCategory,
// //       description: form.description,
// //       location: {
// //         postcode: form.postcode,
// //         city: form.city,
// //       },
// //       startTime: form.startTime,
// //       jobStage: form.jobStage,
// //       ownership: form.ownership,
// //       budgetMin: Number(form.budgetMin) || 0,
// //       budgetMax: Number(form.budgetMax) || 0,
// //       media: uploadedMedia,
// //       contactName: form.contactName,
// //       contactPhone: form.contactPhone,
// //       contactEmail: form.contactEmail,
// //       userId: userId,
// //     };

// //     console.log("📦 PAYLOAD:", payload);

// //     try {
// //       setLoading(true);
// //       // Show loading toast
// //       const loadingToast = toast.loading("Creating your job...", {
// //         position: "top-center",
// //         style: {
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //       });

// //       const res = await fetch("/api/jobs", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         credentials: "include",
// //         body: JSON.stringify(payload),
// //       });

// //       console.log("🌐 RESPONSE STATUS:", res.status);
// //       const data = await res.json();
// //       console.log("✅ RESPONSE DATA:", data);

// //       // Dismiss loading toast
// //       toast.dismiss(loadingToast);

// //       if (!res.ok) throw new Error(data.message || "Failed to create job");

// //       // Show success toast
// //       toast.success("🎉 Job created successfully!", {
// //         duration: 3000,
// //         position: "top-center",
// //         style: {
// //           background: "#10B981",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //           fontWeight: "600",
// //         },
// //         icon: "✅",
// //       });

// //       // Reset form - preserve user info
// //       setForm({
// //         category: "",
// //         subCategory: "",
// //         ownership: "OWNER",
// //         description: "",
// //         postcode: "",
// //         city: "",
// //         startTime: "WITHIN_2_WEEKS",
// //         jobStage: "PLANNING",
// //         budgetMin: "",
// //         budgetMax: "",
// //         contactName: user?.name || user?.user?.name || "",
// //         contactPhone: user?.phone || user?.user?.phone || "",
// //         contactEmail: user?.email || user?.user?.email || "",
// //       });
// //       setUploadedMedia([]);
// //       setCurrentStep(1);
// //       setIsOpen(false);

// //       // Redirect to home page after 2 seconds
// //       setTimeout(() => {
// //         router.push("/");
// //       }, 2000);
// //     } catch (err) {
// //       console.error("❌ ERROR:", err);
// //       // Show error toast
// //       toast.error(err.message || "Failed to create job. Please try again.", {
// //         duration: 4000,
// //         position: "top-center",
// //         style: {
// //           background: "#EF4444",
// //           color: "#fff",
// //           padding: "16px",
// //           borderRadius: "10px",
// //           fontSize: "16px",
// //         },
// //         icon: "❌",
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const canProceed = () => {
// //     switch (currentStep) {
// //       case 1:
// //         return form.category && form.subCategory;
// //       case 2:
// //         return form.ownership;
// //       case 3:
// //         return form.description.length >= 25;
// //       case 4:
// //         return form.budgetMin && form.budgetMax;
// //       case 5:
// //         return form.postcode;
// //       case 6:
// //         return form.contactName && form.contactPhone && form.contactEmail;
// //       default:
// //         return false;
// //     }
// //   };

// //   // Helper function to get display email
// //   const getDisplayEmail = () => {
// //     return user?.email || user?.user?.email || "Not logged in";
// //   };

// //   // Helper function to get user name for display
// //   const getDisplayName = () => {
// //     return user?.name || user?.user?.name || "";
// //   };

// //   // Helper function to get user phone for display
// //   const getDisplayPhone = () => {
// //     return user?.phone || user?.user?.phone || "";
// //   };

// //   return (
// //     <>
// //       {/* Toast Notifications */}
// //       <Toaster />

// //       {/* Step 1: Dropdown Style Form (Shows on Homepage) */}
// //       {!isOpen && currentStep === 1 && (
// //         <div className="w-full max-w-4xl mx-auto">
// //           <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-2xl">
// //             <p className="text-white text-center mb-4 text-sm">
// //               Post your job for free. Get quotes. Read reviews.
// //             </p>
            
// //             <div className="grid md:grid-cols-2 gap-4 mb-4">
// //               {/* Category Dropdown */}
// //               <div>
// //                 <label className="block text-white text-sm font-medium mb-2">
// //                   What type of tradesperson do you need?
// //                 </label>
// //                 <select
// //                   name="category"
// //                   value={form.category}
// //                   onChange={handleChange}
// //                   className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
// //                 >
// //                   <option value="">Please select</option>
// //                   {categories.map((cat) => (
// //                     <option key={cat._id} value={cat._id}>
// //                       {cat.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* SubCategory Dropdown */}
// //               <div>
// //                 <label className="block text-white text-sm font-medium mb-2">
// //                   What type of job is it?
// //                 </label>
// //                 <select
// //                   name="subCategory"
// //                   value={form.subCategory}
// //                   onChange={handleChange}
// //                   disabled={!form.category}
// //                   className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#84cc16] disabled:bg-gray-100 disabled:cursor-not-allowed"
// //                 >
// //                   <option value="">Please select</option>
// //                   {filteredSubCategories.map((sub) => (
// //                     <option key={sub._id} value={sub._id}>
// //                       {sub.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
// //             </div>

// //             <button
// //               onClick={nextStep}
// //               disabled={!canProceed()}
// //               className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-6 rounded transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#84cc16]"
// //             >
// //               Next step &gt;
// //             </button>

// //             <div className="flex items-center justify-center mt-4 text-white text-sm">
// //               <span className="mr-2">Great</span>
// //               <div className="flex gap-1">
// //                 {[1,2,3,4].map(i => (
// //                   <div key={i} className="w-5 h-5 bg-[#84cc16] flex items-center justify-center text-xs">★</div>
// //                 ))}
// //                 <div className="w-5 h-5 bg-gray-400 flex items-center justify-center text-xs">★</div>
// //               </div>
// //               <span className="ml-2 underline cursor-pointer">19,124 reviews on Trustpilot</span>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Steps 2-6: Modal Popup */}
// //       {isOpen && currentStep > 1 && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
// //           <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
// //             {/* Header */}
// //             <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 bg-[#84cc16] rounded flex items-center justify-center text-white font-bold">
// //                   L
// //                 </div>
// //                 <div>
// //                   <span className="font-bold text-lg">Leadsharing</span>
// //                   <p className="text-xs text-gray-500">
// //                     {isLoadingUser ? "Loading user info..." : 
// //                      `Logged in as: ${getDisplayEmail()}`}
// //                   </p>
// //                 </div>
// //               </div>
// //               <button
// //                 onClick={() => { setIsOpen(false); setCurrentStep(1); }}
// //                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
// //               >
// //                 ×
// //               </button>
// //             </div>

// //             {/* Progress Bar */}
// //             <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
// //               <div className="flex items-center justify-between mb-2">
// //                 <span className="text-sm font-medium text-gray-700">
// //                   Step {currentStep} of 6
// //                 </span>
// //                 <span className="text-sm text-gray-500">
// //                   {currentStep === 6 ? "Final step" : `${6 - currentStep} steps left`}
// //                 </span>
// //               </div>
// //               <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
// //                 <div
// //                   className="h-full bg-[#84cc16] transition-all duration-300"
// //                   style={{ width: `${(currentStep / 6) * 100}%` }}
// //                 />
// //               </div>
// //             </div>

// //             {/* Form Content */}
// //             <form onSubmit={handleSubmit}>
// //               <div className="p-6">
// //                 {/* Step 2: Ownership */}
// //                 {currentStep === 2 && (
// //                   <div className="space-y-6">
// //                     <h2 className="text-2xl font-bold text-gray-800">
// //                       Are you the owner or authorised to make property changes?
// //                     </h2>
// //                     <div className="space-y-3">
// //                       {[
// //                         { value: "OWNER", label: "I own and live at this property" },
// //                         { value: "LANDLORD", label: "I am the landlord" },
// //                         {
// //                           value: "AUTHORIZED",
// //                           label: "I rent, but am authorised to make changes to this property",
// //                         },
// //                         {
// //                           value: "BUYING",
// //                           label: "I am looking to buy this property",
// //                         },
// //                       ].map((option) => (
// //                         <button
// //                           key={option.value}
// //                           type="button"
// //                           onClick={() =>
// //                             setForm((prev) => ({ ...prev, ownership: option.value }))
// //                           }
// //                           className={`w-full p-4 border-2 rounded-lg text-left transition ${
// //                             form.ownership === option.value
// //                               ? "border-[#84cc16] bg-green-50"
// //                               : "border-gray-200 hover:border-gray-300"
// //                           }`}
// //                         >
// //                           {option.label}
// //                         </button>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* Step 3: Description */}
// //                 {currentStep === 3 && (
// //                   <div className="space-y-6">
// //                     <div>
// //                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                         Describe what needs to be done
// //                       </h2>
// //                       <p className="text-sm text-gray-500">
// //                         At least 25 characters please ({form.description.length}/25)
// //                       </p>
// //                     </div>
// //                     <textarea
// //                       name="description"
// //                       value={form.description}
// //                       onChange={handleChange}
// //                       rows="6"
// //                       className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                       placeholder="Describe the work you need done..."
// //                     />

// //                     {/* Media Upload Section */}
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-3">
// //                         Add photos or videos (optional)
// //                       </label>
// //                       <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#84cc16] transition">
// //                         <input
// //                           type="file"
// //                           multiple
// //                           accept="image/*,video/*"
// //                           onChange={handleFileUpload}
// //                           disabled={uploadingMedia}
// //                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
// //                         />
// //                         {uploadingMedia ? (
// //                           <div className="flex flex-col items-center">
// //                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84cc16] mb-3"></div>
// //                             <p className="text-gray-600">Uploading...</p>
// //                           </div>
// //                         ) : (
// //                           <>
// //                             <div className="text-gray-400 mb-2">📁</div>
// //                             <p className="text-sm text-gray-600 font-medium">
// //                               Click to upload or drag and drop
// //                             </p>
// //                             <p className="text-xs text-gray-500 mt-1">
// //                               Images or videos (max 10MB)
// //                             </p>
// //                           </>
// //                         )}
// //                       </div>

// //                       {/* Uploaded Media Preview */}
// //                       {uploadedMedia.length > 0 && (
// //                         <div className="grid grid-cols-3 gap-3 mt-4">
// //                           {uploadedMedia.map((media, index) => (
// //                             <div key={index} className="relative group">
// //                               {media.type === "IMAGE" ? (
// //                                 <img
// //                                   src={media.url}
// //                                   alt="Uploaded"
// //                                   className="w-full h-24 object-cover rounded-lg"
// //                                 />
// //                               ) : (
// //                                 <video
// //                                   src={media.url}
// //                                   className="w-full h-24 object-cover rounded-lg"
// //                                 />
// //                               )}
// //                               <button
// //                                 type="button"
// //                                 onClick={() => removeMedia(index)}
// //                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
// //                               >
// //                                 ×
// //                               </button>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* Step 4: Budget */}
// //                 {currentStep === 4 && (
// //                   <div className="space-y-6">
// //                     <div>
// //                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                         Roughly, what's your budget?
// //                       </h2>
// //                       <p className="text-sm text-gray-500">
// //                         You're not committing to anything here. It's just a guide.
// //                       </p>
// //                     </div>
// //                     <div className="grid grid-cols-2 gap-4">
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-2">
// //                           Minimum Budget (£)
// //                         </label>
// //                         <input
// //                           type="number"
// //                           name="budgetMin"
// //                           value={form.budgetMin}
// //                           onChange={handleChange}
// //                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                           placeholder="500"
// //                         />
// //                       </div>
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-2">
// //                           Maximum Budget (£)
// //                         </label>
// //                         <input
// //                           type="number"
// //                           name="budgetMax"
// //                           value={form.budgetMax}
// //                           onChange={handleChange}
// //                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                           placeholder="1000"
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* Step 5: Location & Additional Details */}
// //                 {currentStep === 5 && (
// //                   <div className="space-y-6">
// //                     <div>
// //                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                         Job details
// //                       </h2>
// //                       <p className="text-sm text-gray-500">
// //                         Provide additional information about when you need the work done
// //                         and where it will take place.
// //                       </p>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Where will the job take place? *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         name="postcode"
// //                         value={form.postcode}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                         placeholder="SW1A 1AA"
// //                       />
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         City (optional)
// //                       </label>
// //                       <input
// //                         type="text"
// //                         name="city"
// //                         value={form.city}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                         placeholder="London"
// //                       />
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         When do you need the work done? *
// //                       </label>
// //                       <select
// //                         name="startTime"
// //                         value={form.startTime}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                       >
// //                         <option value="URGENT">Urgent</option>
// //                         <option value="WITHIN_2_DAYS">Within 2 Days</option>
// //                         <option value="WITHIN_2_WEEKS">Within 2 Weeks</option>
// //                         <option value="WITHIN_2_MONTHS">Within 2 Months</option>
// //                         <option value="FLEXIBLE">Flexible</option>
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         What stage is your project at? *
// //                       </label>
// //                       <select
// //                         name="jobStage"
// //                         value={form.jobStage}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                       >
// //                         <option value="READY_TO_HIRE">Ready to hire</option>
// //                         <option value="PLANNING">Planning</option>
// //                         <option value="INSURANCE_WORK">Insurance work</option>
// //                       </select>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* Step 6: Contact Information - IMPROVED VERSION */}
// //                 {currentStep === 6 && (
// //                   <div className="space-y-6">
// //                     <div>
// //                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                         Contact Information
// //                       </h2>
// //                       <p className="text-sm text-gray-500">
// //                         This information will be shared with tradespeople when they unlock your job.
// //                       </p>
// //                       {user && getDisplayEmail() !== "Not logged in" && (
// //                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
// //                           <p className="text-sm text-blue-800">
// //                             <span className="font-semibold">Note:</span> Your contact information has been pre-filled from your account.
// //                           </p>
// //                         </div>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Full Name *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         name="contactName"
// //                         value={form.contactName}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                         placeholder="John Doe"
// //                         required
// //                       />
// //                       {getDisplayName() && (
// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Pre-filled from your account: {getDisplayName()}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Phone Number *
// //                       </label>
// //                       <input
// //                         type="tel"
// //                         name="contactPhone"
// //                         value={form.contactPhone}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                         placeholder="+44 7700 900000"
// //                         required
// //                       />
// //                       {getDisplayPhone() && (
// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Pre-filled from your account: {getDisplayPhone()}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Email Address *
// //                       </label>
// //                       <input
// //                         type="email"
// //                         name="contactEmail"
// //                         value={form.contactEmail}
// //                         onChange={handleChange}
// //                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
// //                         placeholder="john@example.com"
// //                         required
// //                       />
// //                       {getDisplayEmail() !== "Not logged in" && (
// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Pre-filled from your account: {getDisplayEmail()}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
// //                       <p className="text-sm text-green-800">
// //                         <span className="font-semibold">💡 Note:</span> Your contact information will only be visible to tradespeople who purchase your job lead. This helps them get in touch with you directly.
// //                       </p>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Navigation Buttons */}
// //               <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-4">
// //                 {currentStep > 1 && (
// //                   <button
// //                     type="button"
// //                     onClick={prevStep}
// //                     className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
// //                   >
// //                     Back
// //                   </button>
// //                 )}
// //                 {currentStep < 6 ? (
// //                   <button
// //                     type="button"
// //                     onClick={nextStep}
// //                     disabled={!canProceed()}
// //                     className="flex-1 py-3 px-6 bg-[#84cc16] text-white rounded-lg font-medium hover:bg-[#65a30d] transition disabled:opacity-50 disabled:cursor-not-allowed"
// //                   >
// //                     Next step →
// //                   </button>
// //                 ) : (
// //                   <button
// //                     type="submit"
// //                     disabled={!canProceed() || loading}
// //                     className="flex-1 py-3 px-6 bg-[#84cc16] text-white rounded-lg font-medium hover:bg-[#65a30d] transition disabled:opacity-50 disabled:cursor-not-allowed"
// //                   >
// //                     {loading ? "Creating..." : "Submit Job"}
// //                   </button>
// //                 )}
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }





















// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { toast, Toaster } from "react-hot-toast";

// export default function JobCreationForm() {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [uploadingMedia, setUploadingMedia] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
//   const [uploadedMedia, setUploadedMedia] = useState([]);
//   const [user, setUser] = useState(null);
//   const [isLoadingUser, setIsLoadingUser] = useState(true);

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

//   // Fetch user data from API - useCallback to prevent infinite re-renders
//   const fetchUser = useCallback(async () => {
//     try {
//       setIsLoadingUser(true);
//       console.log("Fetching user from /api/me");
//       const res = await fetch("/api/me", {
//         credentials: "include",
//         cache: "no-store",
//       });
      
//       console.log("User fetch response status:", res.status);
      
//       if (res.ok) {
//         const userData = await res.json();
//         console.log("User Data fetched:", userData);
//         setUser(userData);
//       } else {
//         console.log("User not authenticated, status:", res.status);
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       setUser(null);
//     } finally {
//       setIsLoadingUser(false);
//     }
//   }, []);

//   // Fetch user on mount
//   useEffect(() => {
//     fetchUser();
//   }, [fetchUser]);

//   // Fetch categories and subcategories on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [catRes, subRes] = await Promise.all([
//           fetch("/api/categories"),
//           fetch("/api/subcategories"),
//         ]);
//         const catData = await catRes.json();
//         const subData = await subRes.json();
//         setCategories(catData);
//         setSubCategories(subData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, []);

//   // Pre-fill contact info from user data - IMPROVED VERSION
//   useEffect(() => {
//     console.log("User in pre-fill effect:", user);
    
//     if (user && !isLoadingUser) {
//       // More flexible user data extraction
//       const userName = user.name || user.user?.name || "";
//       const userPhone = user.phone || user.user?.phone || "";
//       const userEmail = user.email || user.user?.email || "";
      
//       console.log("Extracted user data:", {
//         name: userName,
//         phone: userPhone,
//         email: userEmail
//       });

//       // Only update if we have at least email (most critical field)
//       if (userEmail) {
//         setForm((prev) => ({
//           ...prev,
//           contactName: userName || prev.contactName,
//           contactPhone: userPhone || prev.contactPhone,
//           contactEmail: userEmail,
//         }));
//         console.log("Form updated with user data");
//       } else {
//         console.warn("No email found in user object:", user);
//       }
//     }
//   }, [user, isLoadingUser]);

//   // Filter subcategories based on selected category
//   useEffect(() => {
//     if (form.category) {
//       const filtered = subCategories.filter(
//         (sub) => sub.category._id === form.category || sub.category === form.category
//       );
//       setFilteredSubCategories(filtered);
//     } else {
//       setFilteredSubCategories([]);
//     }
//   }, [form.category, subCategories]);

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     setUploadingMedia(true);
//     const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`, {
//       position: "top-center",
//       style: {
//         padding: "16px",
//         borderRadius: "10px",
//         fontSize: "16px",
//       },
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
//           throw new Error("Upload failed");
//         }
//         return await res.json();
//       });

//       const results = await Promise.all(uploadPromises);
//       setUploadedMedia((prev) => [...prev, ...results]);

//       toast.dismiss(uploadingToast);
//       toast.success(`✅ ${results.length} file(s) uploaded successfully!`, {
//         duration: 3000,
//         position: "top-center",
//         style: {
//           background: "#10B981",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "📁",
//       });
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.dismiss(uploadingToast);
//       toast.error("Upload failed. Please try again.", {
//         duration: 4000,
//         position: "top-center",
//         style: {
//           background: "#EF4444",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "❌",
//       });
//     } finally {
//       setUploadingMedia(false);
//     }
//   };

//   const removeMedia = (index) => {
//     setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
//   };

//   const nextStep = () => {
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("🔥 SUBMIT CLICKED");
//     console.log("👤 Current user state:", user);

//     // Check if user data is still loading
//     if (isLoadingUser) {
//       toast.error("Please wait while we verify your account...", {
//         duration: 4000,
//         position: "top-center",
//         style: {
//           background: "#EF4444",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "⏳",
//       });
//       return;
//     }

//     // IMPROVED: More flexible user check
//     const userEmail = user?.email || user?.user?.email;
//     const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
//     const userRole = user?.role || user?.user?.role;

//     console.log("Extracted user details:", {
//       email: userEmail,
//       id: userId,
//       role: userRole
//     });

//     // Check if user is logged in - IMPROVED CHECK
//     if (!userEmail || !userId) {
//       console.log("User not found, redirecting to login");
//       toast.error("Please log in first to create a job", {
//         duration: 4000,
//         position: "top-center",
//         style: {
//           background: "#EF4444",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "🔒",
//       });
//       // Redirect to login page after 1.5 seconds
//       setTimeout(() => {
//         router.push("/auth/login");
//       }, 1500);
//       return;
//     }

//     // Check if user role is HOMEOWNER
//     if (userRole !== "HOMEOWNER") {
//       toast.error("Only homeowners can create jobs", {
//         duration: 4000,
//         position: "top-center",
//         style: {
//           background: "#EF4444",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "⚠️",
//       });
//       // Redirect to home page after 2 seconds
//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//       return;
//     }

//     const payload = {
//       category: form.category,
//       subCategory: form.subCategory,
//       description: form.description,
//       location: {
//         postcode: form.postcode,
//         city: form.city,
//       },
//       startTime: form.startTime,
//       jobStage: form.jobStage,
//       ownership: form.ownership,
//       budgetMin: Number(form.budgetMin) || 0,
//       budgetMax: Number(form.budgetMax) || 0,
//       media: uploadedMedia,
//       contactName: form.contactName,
//       contactPhone: form.contactPhone,
//       contactEmail: form.contactEmail,
//       userId: userId,
//     };

//     console.log("📦 PAYLOAD:", payload);

//     try {
//       setLoading(true);
//       // Show loading toast
//       const loadingToast = toast.loading("Creating your job...", {
//         position: "top-center",
//         style: {
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//       });

//       const res = await fetch("/api/jobs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       console.log("🌐 RESPONSE STATUS:", res.status);
//       const data = await res.json();
//       console.log("✅ RESPONSE DATA:", data);

//       // Dismiss loading toast
//       toast.dismiss(loadingToast);

//       if (!res.ok) throw new Error(data.message || "Failed to create job");

//       // Show success toast
//       toast.success("🎉 Job created successfully!", {
//         duration: 3000,
//         position: "top-center",
//         style: {
//           background: "#10B981",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//           fontWeight: "600",
//         },
//         icon: "✅",
//       });

//       // Reset form - preserve user info
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

//       // Redirect to home page after 2 seconds
//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     } catch (err) {
//       console.error("❌ ERROR:", err);
//       // Show error toast
//       toast.error(err.message || "Failed to create job. Please try again.", {
//         duration: 4000,
//         position: "top-center",
//         style: {
//           background: "#EF4444",
//           color: "#fff",
//           padding: "16px",
//           borderRadius: "10px",
//           fontSize: "16px",
//         },
//         icon: "❌",
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
//         return form.description.length >= 25;
//       case 4:
//         return form.budgetMin && form.budgetMax;
//       case 5:
//         return form.postcode;
//       case 6:
//         return form.contactName && form.contactPhone && form.contactEmail;
//       default:
//         return false;
//     }
//   };

//   // Helper function to get display email
//   const getDisplayEmail = () => {
//     return user?.email || user?.user?.email || "Not logged in";
//   };

//   // Helper function to get user name for display
//   const getDisplayName = () => {
//     return user?.name || user?.user?.name || "";
//   };

//   // Helper function to get user phone for display
//   const getDisplayPhone = () => {
//     return user?.phone || user?.user?.phone || "";
//   };

//   return (
//     <>
//       {/* Toast Notifications */}
//       <Toaster />

//       {/* Step 1: Dropdown Style Form (Shows on Homepage) */}
//       {!isOpen && currentStep === 1 && (
//         <div className="w-full max-w-4xl mx-auto">
//           <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-2xl">
//             <p className="text-white text-center mb-4 text-sm">
//               Post your job for free. Get quotes. Read reviews.
//             </p>
            
//             <div className="grid md:grid-cols-2 gap-4 mb-4">
//               {/* Category Dropdown */}
//               <div>
//                 <label className="block text-white text-sm font-medium mb-2">
//                   What type of tradesperson do you need?
//                 </label>
//                 <select
//                   name="category"
//                   value={form.category}
//                   onChange={handleChange}
//                   className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
//                 >
//                   <option value="">Please select</option>
//                   {categories.map((cat) => (
//                     <option key={cat._id} value={cat._id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* SubCategory Dropdown */}
//               <div>
//                 <label className="block text-white text-sm font-medium mb-2">
//                   What type of job is it?
//                 </label>
//                 <select
//                   name="subCategory"
//                   value={form.subCategory}
//                   onChange={handleChange}
//                   disabled={!form.category}
//                   className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#84cc16] disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">Please select</option>
//                   {filteredSubCategories.map((sub) => (
//                     <option key={sub._id} value={sub._id}>
//                       {sub.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <button
//               onClick={nextStep}
//               disabled={!canProceed()}
//               className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold py-3 px-6 rounded transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#84cc16]"
//             >
//               Next step &gt;
//             </button>

//             <div className="flex items-center justify-center mt-4 text-white text-sm">
//               <span className="mr-2">Great</span>
//               <div className="flex gap-1">
//                 {[1,2,3,4].map(i => (
//                   <div key={i} className="w-5 h-5 bg-[#84cc16] flex items-center justify-center text-xs">★</div>
//                 ))}
//                 <div className="w-5 h-5 bg-gray-400 flex items-center justify-center text-xs">★</div>
//               </div>
//               <span className="ml-2 underline cursor-pointer">19,124 reviews on Trustpilot</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Steps 2-6: Modal Popup */}
//       {isOpen && currentStep > 1 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//             {/* Header */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-[#84cc16] rounded flex items-center justify-center text-white font-bold">
//                   L
//                 </div>
//                 <div>
//                   <span className="font-bold text-lg">Leadsharing</span>
//                   <p className="text-xs text-gray-500">
//                     {isLoadingUser ? "Loading user info..." : 
//                      `Logged in as: ${getDisplayEmail()}`}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => { setIsOpen(false); setCurrentStep(1); }}
//                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Progress Bar */}
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
//                   className="h-full bg-[#84cc16] transition-all duration-300"
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
//                         {
//                           value: "AUTHORIZED",
//                           label: "I rent, but am authorised to make changes to this property",
//                         },
//                         {
//                           value: "BUYING",
//                           label: "I am looking to buy this property",
//                         },
//                       ].map((option) => (
//                         <button
//                           key={option.value}
//                           type="button"
//                           onClick={() =>
//                             setForm((prev) => ({ ...prev, ownership: option.value }))
//                           }
//                           className={`w-full p-4 border-2 rounded-lg text-left transition ${
//                             form.ownership === option.value
//                               ? "border-[#84cc16] bg-green-50"
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
//                       <p className="text-sm text-gray-500">
//                         At least 25 characters please ({form.description.length}/25)
//                       </p>
//                     </div>
//                     <textarea
//                       name="description"
//                       value={form.description}
//                       onChange={handleChange}
//                       rows="6"
//                       className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                       placeholder="Describe the work you need done..."
//                     />

//                     {/* Media Upload Section */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Add photos or videos (optional)
//                       </label>
//                       <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#84cc16] transition">
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/*,video/*"
//                           onChange={handleFileUpload}
//                           disabled={uploadingMedia}
//                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                         />
//                         {uploadingMedia ? (
//                           <div className="flex flex-col items-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84cc16] mb-3"></div>
//                             <p className="text-gray-600">Uploading...</p>
//                           </div>
//                         ) : (
//                           <>
//                             <div className="text-gray-400 mb-2">📁</div>
//                             <p className="text-sm text-gray-600 font-medium">
//                               Click to upload or drag and drop
//                             </p>
//                             <p className="text-xs text-gray-500 mt-1">
//                               Images or videos (max 10MB)
//                             </p>
//                           </>
//                         )}
//                       </div>

//                       {/* Uploaded Media Preview */}
//                       {uploadedMedia.length > 0 && (
//                         <div className="grid grid-cols-3 gap-3 mt-4">
//                           {uploadedMedia.map((media, index) => (
//                             <div key={index} className="relative group">
//                               {media.type === "IMAGE" ? (
//                                 <img
//                                   src={media.url}
//                                   alt="Uploaded"
//                                   className="w-full h-24 object-cover rounded-lg"
//                                 />
//                               ) : (
//                                 <video
//                                   src={media.url}
//                                   className="w-full h-24 object-cover rounded-lg"
//                                 />
//                               )}
//                               <button
//                                 type="button"
//                                 onClick={() => removeMedia(index)}
//                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                               >
//                                 ×
//                               </button>
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
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                           placeholder="500"
//                         />
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
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                           placeholder="1000"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 5: Location & Additional Details */}
//                 {currentStep === 5 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Job details
//                       </h2>
//                       <p className="text-sm text-gray-500">
//                         Provide additional information about when you need the work done
//                         and where it will take place.
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                         placeholder="SW1A 1AA"
//                       />
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                       >
//                         <option value="READY_TO_HIRE">Ready to hire</option>
//                         <option value="PLANNING">Planning</option>
//                         <option value="INSURANCE_WORK">Insurance work</option>
//                       </select>
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 6: Contact Information - IMPROVED VERSION */}
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
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                         placeholder="John Doe"
//                         required
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                         placeholder="+44 7700 900000"
//                         required
//                       />
//                       {getDisplayPhone() && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Pre-filled from your account: {getDisplayPhone()}
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
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#84cc16] focus:ring-2 focus:ring-green-100 transition"
//                         placeholder="john@example.com"
//                         required
//                       />
//                       {getDisplayEmail() !== "Not logged in" && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Pre-filled from your account: {getDisplayEmail()}
//                         </p>
//                       )}
//                     </div>

//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                       <p className="text-sm text-green-800">
//                         <span className="font-semibold">💡 Note:</span> Your contact information will only be visible to tradespeople who purchase your job lead. This helps them get in touch with you directly.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Navigation Buttons */}
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
//                     className="flex-1 py-3 px-6 bg-[#84cc16] text-white rounded-lg font-medium hover:bg-[#65a30d] transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next step →
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     disabled={!canProceed() || loading}
//                     className="flex-1 py-3 px-6 bg-[#84cc16] text-white rounded-lg font-medium hover:bg-[#65a30d] transition disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function JobCreationForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();
        setCategories(catData);
        setSubCategories(subData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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

  // Filter subcategories based on selected category
  useEffect(() => {
    if (form.category) {
      const filtered = subCategories.filter(
        (sub) => sub.category._id === form.category || sub.category === form.category
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [form.category, subCategories]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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
          throw new Error("Upload failed");
        }
        return await res.json();
      });

      const results = await Promise.all(uploadPromises);
      setUploadedMedia((prev) => [...prev, ...results]);

      toast.dismiss(uploadingToast);
      toast.success(`✅ ${results.length} file(s) uploaded successfully!`, {
        position: "top-center",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(uploadingToast);
      toast.error("Upload failed. Please try again.", {
        position: "top-center",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoadingUser) {
      toast.error("Please wait while we verify your account...", {
        position: "top-center",
      });
      return;
    }

    const userEmail = user?.email || user?.user?.email;
    const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
    const userRole = user?.role || user?.user?.role;

    if (!userEmail || !userId) {
      toast.error("Please log in first to create a job", {
        position: "top-center",
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    if (userRole !== "HOMEOWNER") {
      toast.error("Only homeowners can create jobs", {
        position: "top-center",
      });
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    const payload = {
      category: form.category,
      subCategory: form.subCategory,
      description: form.description,
      location: {
        postcode: form.postcode,
        city: form.city,
      },
      startTime: form.startTime,
      jobStage: form.jobStage,
      ownership: form.ownership,
      budgetMin: Number(form.budgetMin) || 0,
      budgetMax: Number(form.budgetMax) || 0,
      media: uploadedMedia,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
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

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("❌ ERROR:", err);
      toast.error(err.message || "Failed to create job. Please try again.", {
        position: "top-center",
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
        return form.description.length >= 25;
      case 4:
        return form.budgetMin && form.budgetMax;
      case 5:
        return form.postcode;
      case 6:
        return form.contactName && form.contactPhone && form.contactEmail;
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

  return (
    <>
      <Toaster />

      {/* Initial Form - Matches ratedpeople.com style */}
      {!isOpen && currentStep === 1 && (
        <div className="bg-[#2c2c2c] rounded-lg shadow-2xl max-w-4xl mx-auto p-6 text-left relative z-20">
          <p className="text-white text-center mb-4 text-base">
            Post your job for free. Get quotes. Read reviews.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Category Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-white mb-2">
                What type of tradesperson do you need?
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
            <div className="flex-1">
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
            <div className="flex items-end">
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
              {[1,2,3,4].map(i => (
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
                onClick={() => { setIsOpen(false); setCurrentStep(1); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
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
                          className={`w-full p-4 border-2 rounded-lg text-left transition ${
                            form.ownership === option.value
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
                      <p className="text-sm text-gray-500">
                        At least 25 characters please ({form.description.length}/25)
                      </p>
                    </div>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="6"
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                      placeholder="Describe the work you need done..."
                    />

                    {/* Media Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add photos or videos (optional)
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#1149C7] transition">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          disabled={uploadingMedia}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Images or videos (max 10MB)
                            </p>
                          </>
                        )}
                      </div>

                      {uploadedMedia.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {uploadedMedia.map((media, index) => (
                            <div key={index} className="relative group">
                              {media.type === "IMAGE" ? (
                                <img
                                  src={media.url}
                                  alt="Uploaded"
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ×
                              </button>
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
                        />
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
                        />
                      </div>
                    </div>
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
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#1149C7] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="SW1A 1AA"
                      />
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
                        placeholder="+44 7700 900000"
                        required
                      />
                      {getDisplayPhone() && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pre-filled from your account: {getDisplayPhone()}
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