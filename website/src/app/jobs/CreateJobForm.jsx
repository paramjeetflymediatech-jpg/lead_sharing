// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { toast, Toaster } from "react-hot-toast";

// // Add validation constants
// const VALIDATION_RULES = {
//   MEDIA: {
//     MAX_FILES: 2,
//     MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//     ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
//   },
//   DESCRIPTION: {
//     MIN_LENGTH: 25,
//     MAX_LENGTH: 200,
//   },
//   BUDGET: {
//     MIN: 50,
//     MAX: 100000,
//   },
//   PHONE: {
//     PATTERN: /^(\+1\s?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})$/,
//   },
//   POSTCODE: {
//     PATTERN: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
//   }
// };

// export default function AdminJobCreationForm() {
//   const router = useRouter();
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

//   // Fetch categories on mount
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

//   // Fetch subcategories dynamically when category changes
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

//     if (!isImage) {
//       return {
//         valid: false,
//         error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP, GIF) are allowed.`
//       };
//     }

//     if (file.size > VALIDATION_RULES.MEDIA.MAX_IMAGE_SIZE) {
//       return {
//         valid: false,
//         error: `Image ${file.name} is too large. Maximum size is 5MB.`
//       };
//     }

//     return { valid: true };
//   };

//   // Budget validation
//   const validateBudget = (min, max) => {
//     const minBudget = Number(min);
//     const maxBudget = Number(max);

//     if (minBudget < VALIDATION_RULES.BUDGET.MIN) {
//       return `Minimum budget must be at least $${VALIDATION_RULES.BUDGET.MIN}`;
//     }

//     if (maxBudget > VALIDATION_RULES.BUDGET.MAX) {
//       return `Maximum budget cannot exceed $${VALIDATION_RULES.BUDGET.MAX.toLocaleString()}`;
//     }

//     if (minBudget >= maxBudget) {
//       return "Maximum budget must be greater than minimum budget";
//     }

//     if (maxBudget - minBudget < 100) {
//       return "Budget range should be at least $100";
//     }

//     return null;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Description length validation
//     if (name === "description" && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
//       toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
//         position: "top-right",
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
//       toast.error(`You can only upload a maximum of ${VALIDATION_RULES.MEDIA.MAX_FILES} images`, {
//         position: "top-right",
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
//           position: "top-right",
//           duration: 5000,
//         });
//         e.target.value = "";
//         return;
//       }
//     }

//     setUploadingMedia(true);
//     const uploadingToast = toast.loading(`Uploading ${files.length} image(s)...`, {
//       position: "top-right",
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
//       toast.success(`✅ ${results.length} image(s) uploaded successfully!`, {
//         position: "top-right",
//         duration: 3000,
//       });
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.dismiss(uploadingToast);
//       toast.error(error.message || "Upload failed. Please try again.", {
//         position: "top-right",
//         duration: 4000,
//       });
//     } finally {
//       setUploadingMedia(false);
//       e.target.value = "";
//     }
//   };

//   const removeMedia = (index) => {
//     setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
//   };

//   // Form validation before submit
//   const validateForm = () => {
//     let isValid = true;

//     // Category validation
//     if (!form.category.trim()) {
//       toast.error("Please select a category", {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     // Subcategory validation
//     if (!form.subCategory.trim()) {
//       toast.error("Please select a sub-category", {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     // Description validation
//     if (!form.description.trim()) {
//       toast.error("Please enter a description", {
//         position: "top-right",
//       });
//       isValid = false;
//     } else if (form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH) {
//       toast.error(`Description must be at least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters`, {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     // Postcode validation
//     if (!form.postcode.trim()) {
//       toast.error("Please enter a postcode", {
//         position: "top-right",
//       });
//       isValid = false;
//     } else if (!VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode)) {
//       toast.error("Please enter a valid Canadian postal code (e.g., A1A 1A1)", {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     // Budget validation
//     if (!form.budgetMin.trim() || !form.budgetMax.trim()) {
//       if (!form.budgetMin.trim()) toast.error("Please enter minimum budget", { position: "top-right" });
//       if (!form.budgetMax.trim()) toast.error("Please enter maximum budget", { position: "top-right" });
//       isValid = false;
//     } else {
//       const budgetError = validateBudget(form.budgetMin, form.budgetMax);
//       if (budgetError) {
//         toast.error(budgetError, {
//           position: "top-right",
//           duration: 4000,
//         });
//         isValid = false;
//       }
//     }

//     // Contact name validation
//     if (!form.contactName.trim()) {
//       toast.error("Please enter your name", {
//         position: "top-right",
//       });
//       isValid = false;
//     } else if (form.contactName.length < 2) {
//       toast.error("Name must be at least 2 characters", {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     // Contact phone validation
//     if (!form.contactPhone.trim()) {
//       toast.error("Please enter a phone number", {
//         position: "top-right",
//       });
//       isValid = false;
//     } else if (!VALIDATION_RULES.PHONE.PATTERN.test(form.contactPhone)) {
//       toast.error("Please enter a valid Canadian phone number (e.g., 416-555-0123)", {
//         position: "top-right",
//         duration: 4000,
//       });
//       isValid = false;
//     }

//     // Contact email validation
//     if (!form.contactEmail.trim()) {
//       toast.error("Please enter an email address", {
//         position: "top-right",
//       });
//       isValid = false;
//     } else if (!form.contactEmail.includes('@')) {
//       toast.error("Please enter a valid email address", {
//         position: "top-right",
//       });
//       isValid = false;
//     }

//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (isLoadingUser) {
//       toast.error("Please wait while we verify your account...", {
//         position: "top-right",
//       });
//       return;
//     }

//     // Validate form
//     if (!validateForm()) {
//       return;
//     }

//     const userEmail = user?.email || user?.user?.email;
//     const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
//     const userRole = user?.role || user?.user?.role;

//     if (!userEmail || !userId) {
//       toast.error("Please log in first to create a job", {
//         position: "top-right",
//       });
//       setTimeout(() => {
//         router.push("/auth/login");
//       }, 1500);
//       return;
//     }

//     if (userRole !== "HOMEOWNER") {
//       toast.error("Only homeowners can create jobs", {
//         position: "top-right",
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
//       budgetMin: Number(form.budgetMin) || 0,
//       budgetMax: Number(form.budgetMax) || 0,
//       media: uploadedMedia,
//       contactName: form.contactName.trim(),
//       contactPhone: form.contactPhone.trim(),
//       contactEmail: form.contactEmail.trim().toLowerCase(),
//       userId: userId,
//     };

//     try {
//       setLoading(true);
//       const loadingToast = toast.loading("Creating your job...", {
//         position: "top-right",
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
//         position: "top-right",
//       });

//       // Reset form
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

//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     } catch (err) {
//       console.error("❌ ERROR:", err);
//       toast.error(err.message || "Failed to create job. Please try again.", {
//         position: "top-right",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDisplayEmail = () => {
//     return user?.email || user?.user?.email || "Not logged in";
//   };

//   const getRemainingCharacters = () => {
//     return VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - form.description.length;
//   };

//   const isUploadDisabled = uploadedMedia.length >= VALIDATION_RULES.MEDIA.MAX_FILES;

//   return (
//     <>
//       <Toaster />

//       <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-5xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-[#1149C7] rounded-lg flex items-center justify-center">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
//                     <p className="text-sm text-gray-500">
//                       {isLoadingUser ? "Loading..." : `Logged in as: ${getDisplayEmail()}`}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
//             <div className="p-6 space-y-8">

//               {/* Job Category Section */}
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">1</span>
//                   </div>
//                   Job Category
//                 </h2>
//                 <div className="grid md:grid-cols-2 gap-4 pl-10">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Category *
//                     </label>
//                     <select
//                       name="category"
//                       value={form.category}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       required
//                     >
//                       <option value="">Select category</option>
//                       {categories.map((cat) => (
//                         <option key={cat._id} value={cat._id}>
//                           {cat.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Sub Category *
//                     </label>
//                     <select
//                       name="subCategory"
//                       value={form.subCategory}
//                       onChange={handleChange}
//                       disabled={!form.category}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition disabled:bg-gray-100 disabled:cursor-not-allowed"
//                       required
//                     >
//                       <option value="">Select sub category</option>
//                       {filteredSubCategories.map((sub) => (
//                         <option key={sub._id} value={sub._id}>
//                           {sub.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Property Details Section */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">2</span>
//                   </div>
//                   Property Details
//                 </h2>
//                 <div className="pl-10 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Ownership Status *
//                     </label>
//                     <select
//                       name="ownership"
//                       value={form.ownership}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       required
//                     >
//                       <option value="OWNER">I own and live at this property</option>
//                       <option value="LANDLORD">I am the landlord</option>
//                       <option value="AUTHORIZED">I rent, but am authorised to make changes</option>
//                       <option value="BUYING">I am looking to buy this property</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Job Description Section */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">3</span>
//                   </div>
//                   Job Description
//                 </h2>
//                 <div className="pl-10 space-y-4">
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <label className="block text-sm font-medium text-gray-700">
//                         Description *
//                       </label>
//                       <span className={`text-xs ${form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
//                           ? 'text-red-600 font-semibold'
//                           : getRemainingCharacters() < 50
//                             ? 'text-amber-600'
//                             : 'text-gray-500'
//                         }`}>
//                         {form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
//                           ? `${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters minimum`
//                           : `${form.description.length} characters (${getRemainingCharacters()} remaining)`
//                         }
//                       </span>
//                     </div>
//                     <textarea
//                       name="description"
//                       value={form.description}
//                       onChange={handleChange}
//                       rows="5"
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="Describe the work you need done in detail..."
//                       maxLength={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
//                       required
//                       minLength={25}
//                     />
//                   </div>

//                   {/* Media Upload - ONLY IMAGES */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Photos (Optional)
//                       <span className="ml-2 text-gray-400">
//                         ({uploadedMedia.length}/{VALIDATION_RULES.MEDIA.MAX_FILES} images)
//                       </span>
//                     </label>

//                     {isUploadDisabled && (
//                       <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
//                         <p className="text-sm text-amber-800">
//                           ⚠️ Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} images allowed. Remove existing images to upload new ones.
//                         </p>
//                       </div>
//                     )}

//                     <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition ${isUploadDisabled
//                         ? 'border-gray-200 bg-gray-50'
//                         : 'hover:border-[#1149C7]'
//                       }`}>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" // ONLY IMAGES
//                         onChange={handleFileUpload}
//                         disabled={uploadingMedia || isUploadDisabled}
//                         className="hidden"
//                         id="file-upload"
//                       />
//                       <label htmlFor="file-upload" className="cursor-pointer">
//                         {uploadingMedia ? (
//                           <div className="flex flex-col items-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mb-3"></div>
//                             <p className="text-gray-600">Uploading...</p>
//                           </div>
//                         ) : (
//                           <>
//                             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             <p className="mt-2 text-sm text-gray-600 font-medium">
//                               {isUploadDisabled ? 'Maximum images reached' : 'Click to upload photos'}
//                             </p>
//                             {!isUploadDisabled && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 JPG, PNG, WebP, or GIF (max 5MB each)
//                               </p>
//                             )}
//                           </>
//                         )}
//                       </label>
//                     </div>

//                     {/* Uploaded Media Preview */}
//                     {uploadedMedia.length > 0 && (
//                       <div className="grid grid-cols-4 gap-3 mt-4">
//                         {uploadedMedia.map((media, index) => (
//                           <div key={index} className="relative group">
//                             <img
//                               src={media.url}
//                               alt="Uploaded"
//                               className="w-full h-24 object-cover rounded-lg border border-gray-200"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removeMedia(index)}
//                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Budget Section */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">4</span>
//                   </div>
//                   Budget
//                 </h2>
//                 <div className="grid md:grid-cols-2 gap-4 pl-10">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Minimum Budget ($) *
//                     </label>
//                     <input
//                       type="number"
//                       name="budgetMin"
//                       value={form.budgetMin}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="500"
//                       required
//                       min="0"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Maximum Budget ($) *
//                     </label>
//                     <input
//                       type="number"
//                       name="budgetMax"
//                       value={form.budgetMax}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="1000"
//                       required
//                       min="0"
//                     />
//                   </div>
//                 </div>
//                 {form.budgetMin && form.budgetMax && !validateBudget(form.budgetMin, form.budgetMax) && (
//                   <div className="pl-10 mt-4">
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
//                       <p className="text-sm text-gray-700">
//                         Budget range: <span className="font-semibold text-green-700">${Number(form.budgetMin).toLocaleString()} - ${Number(form.budgetMax).toLocaleString()}</span>
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Location & Timeline Section */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">5</span>
//                   </div>
//                   Location & Timeline
//                 </h2>
//                 <div className="grid md:grid-cols-2 gap-4 pl-10">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Postcode *
//                     </label>
//                     <input
//                       type="text"
//                       name="postcode"
//                       value={form.postcode}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="SW1A 1AA"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       City
//                     </label>
//                     <input
//                       type="text"
//                       name="city"
//                       value={form.city}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="London"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       When do you need the work done? *
//                     </label>
//                     <select
//                       name="startTime"
//                       value={form.startTime}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       required
//                     >
//                       <option value="URGENT">Urgent</option>
//                       <option value="WITHIN_2_DAYS">Within 2 Days</option>
//                       <option value="WITHIN_2_WEEKS">Within 2 Weeks</option>
//                       <option value="WITHIN_2_MONTHS">Within 2 Months</option>
//                       <option value="FLEXIBLE">Flexible</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Project Stage *
//                     </label>
//                     <select
//                       name="jobStage"
//                       value={form.jobStage}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       required
//                     >
//                       <option value="READY_TO_HIRE">Ready to hire</option>
//                       <option value="PLANNING">Planning</option>
//                       <option value="INSURANCE_WORK">Insurance work</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Information Section */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <span className="text-[#1149C7] font-bold">6</span>
//                   </div>
//                   Contact Information
//                 </h2>
//                 <div className="grid md:grid-cols-2 gap-4 pl-10">
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="contactName"
//                       value={form.contactName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Phone Number *
//                     </label>
//                     <input
//                       type="tel"
//                       name="contactPhone"
//                       value={form.contactPhone}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="+44 7700 900000"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <input
//                       type="email"
//                       name="contactEmail"
//                       value={form.contactEmail}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
//                       placeholder="john@example.com"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//             </div>

//             {/* Submit Section */}
//             <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-8 py-2.5 bg-[#1149C7] hover:bg-[#0d38a0] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     Create Job
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }






"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

// Add validation constants
const VALIDATION_RULES = {
  MEDIA: {
    MAX_FILES: 2,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  },
  DESCRIPTION: {
    MIN_LENGTH: 25,
    MAX_LENGTH: 200,
  },
  BUDGET: {
    MIN: 50,
    MAX: 100000,
  },
  PHONE: {
    PATTERN: /^(\+1\s?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})$/,
  },
  POSTCODE: {
    PATTERN: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ][ -]?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i,
  }
};

export default function AdminJobCreationForm() {
  const router = useRouter();
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

    if (!isImage) {
      return {
        valid: false,
        error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP, GIF) are allowed.`
      };
    }

    if (file.size > VALIDATION_RULES.MEDIA.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image ${file.name} is too large. Maximum size is 5MB.`
      };
    }

    return { valid: true };
  };

  // Budget validation
  const validateBudget = (min, max) => {
    const minBudget = Number(min);
    const maxBudget = Number(max);

    if (minBudget < VALIDATION_RULES.BUDGET.MIN) {
      return `Minimum budget must be at least $${VALIDATION_RULES.BUDGET.MIN}`;
    }

    if (maxBudget > VALIDATION_RULES.BUDGET.MAX) {
      return `Maximum budget cannot exceed $${VALIDATION_RULES.BUDGET.MAX.toLocaleString()}`;
    }

    if (minBudget >= maxBudget) {
      return "Maximum budget must be greater than minimum budget";
    }

    if (maxBudget - minBudget < 100) {
      return "Budget range should be at least $100";
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Description length validation
    if (name === "description" && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
      toast.error(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`, {
        position: "top-right",
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
      toast.error(`You can only upload a maximum of ${VALIDATION_RULES.MEDIA.MAX_FILES} images`, {
        position: "top-right",
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
          position: "top-right",
          duration: 5000,
        });
        e.target.value = "";
        return;
      }
    }

    setUploadingMedia(true);
    const uploadingToast = toast.loading(`Uploading ${files.length} image(s)...`, {
      position: "top-right",
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
      toast.success(`✅ ${results.length} image(s) uploaded successfully!`, {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(uploadingToast);
      toast.error(error.message || "Upload failed. Please try again.", {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeMedia = (index) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Form validation before submit
  const validateForm = () => {
    let isValid = true;

    // Category validation
    if (!form.category.trim()) {
      toast.error("Please select a category", {
        position: "top-right",
      });
      isValid = false;
    }

    // Subcategory validation
    if (!form.subCategory.trim()) {
      toast.error("Please select a sub-category", {
        position: "top-right",
      });
      isValid = false;
    }

    // Description validation
    if (!form.description.trim()) {
      toast.error("Please enter a description", {
        position: "top-right",
      });
      isValid = false;
    } else if (form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH) {
      toast.error(`Description must be at least ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters`, {
        position: "top-right",
      });
      isValid = false;
    }

    // Postcode validation
    if (!form.postcode.trim()) {
      toast.error("Please enter a postcode", {
        position: "top-right",
      });
      isValid = false;
    } else if (!VALIDATION_RULES.POSTCODE.PATTERN.test(form.postcode)) {
      toast.error("Please enter a valid Canadian postal code (e.g., A1A 1A1)", {
        position: "top-right",
      });
      isValid = false;
    }

    // Budget validation
    if (!form.budgetMin.trim() || !form.budgetMax.trim()) {
      if (!form.budgetMin.trim()) toast.error("Please enter minimum budget", { position: "top-right" });
      if (!form.budgetMax.trim()) toast.error("Please enter maximum budget", { position: "top-right" });
      isValid = false;
    } else {
      const budgetError = validateBudget(form.budgetMin, form.budgetMax);
      if (budgetError) {
        toast.error(budgetError, {
          position: "top-right",
          duration: 4000,
        });
        isValid = false;
      }
    }

    // Contact name validation
    if (!form.contactName.trim()) {
      toast.error("Please enter your name", {
        position: "top-right",
      });
      isValid = false;
    } else if (form.contactName.length < 2) {
      toast.error("Name must be at least 2 characters", {
        position: "top-right",
      });
      isValid = false;
    }

    // Contact phone validation
    // Phone validation removed as per request

    // Contact email validation
    if (!form.contactEmail.trim()) {
      toast.error("Please enter an email address", {
        position: "top-right",
      });
      isValid = false;
    } else if (!form.contactEmail.includes('@')) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
      });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoadingUser) {
      toast.error("Please wait while we verify your account...", {
        position: "top-right",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    const userEmail = user?.email || user?.user?.email;
    const userId = user?._id || user?.id || user?.userId || user?.user?._id || user?.user?.id;
    const userRole = user?.role || user?.user?.role;

    if (!userEmail || !userId) {
      toast.error("Please log in first to create a job", {
        position: "top-right",
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    if (userRole !== "HOMEOWNER") {
      toast.error("Only homeowners can create jobs", {
        position: "top-right",
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
      budgetMin: Number(form.budgetMin) || 0,
      budgetMax: Number(form.budgetMax) || 0,
      media: uploadedMedia,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      userId: userId,
    };

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating your job...", {
        position: "top-right",
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
        position: "top-right",
      });

      // Reset form
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

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("❌ ERROR:", err);
      toast.error(err.message || "Failed to create job. Please try again.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayEmail = () => {
    return user?.email || user?.user?.email || "Not logged in";
  };

  const getRemainingCharacters = () => {
    return VALIDATION_RULES.DESCRIPTION.MAX_LENGTH - form.description.length;
  };

  const isUploadDisabled = uploadedMedia.length >= VALIDATION_RULES.MEDIA.MAX_FILES;

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1149C7] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create New Job</h1>
                    <p className="text-sm text-gray-500">
                      {isLoadingUser ? "Loading..." : `Logged in as: ${getDisplayEmail()}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 space-y-8">

              {/* Job Category Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">1</span>
                  </div>
                  Job Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category *
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                      disabled={!form.category}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select sub category</option>
                      {filteredSubCategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">2</span>
                  </div>
                  Property Details
                </h2>
                <div className="pl-0 md:pl-10 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Status *
                    </label>
                    <select
                      name="ownership"
                      value={form.ownership}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      required
                    >
                      <option value="OWNER">I own and live at this property</option>
                      <option value="LANDLORD">I am the landlord</option>
                      <option value="AUTHORIZED">I rent, but am authorised to make changes</option>
                      <option value="BUYING">I am looking to buy this property</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">3</span>
                  </div>
                  Job Description
                </h2>
                <div className="pl-0 md:pl-10 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <span className={`text-xs ${form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
                        ? 'text-red-600 font-semibold'
                        : getRemainingCharacters() < 50
                          ? 'text-amber-600'
                          : 'text-gray-500'
                        }`}>
                        {form.description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH
                          ? `${form.description.length}/${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} characters minimum`
                          : `${form.description.length} characters (${getRemainingCharacters()} remaining)`
                        }
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="Describe the work you need done in detail..."
                      maxLength={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
                      required
                      minLength={25}
                    />
                  </div>

                  {/* Media Upload - ONLY IMAGES */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos (Optional)
                      <span className="ml-2 text-gray-400">
                        ({uploadedMedia.length}/{VALIDATION_RULES.MEDIA.MAX_FILES} images)
                      </span>
                    </label>

                    {isUploadDisabled && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          ⚠️ Maximum {VALIDATION_RULES.MEDIA.MAX_FILES} images allowed. Remove existing images to upload new ones.
                        </p>
                      </div>
                    )}

                    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition ${isUploadDisabled
                      ? 'border-gray-200 bg-gray-50'
                      : 'hover:border-[#1149C7]'
                      }`}>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" // ONLY IMAGES
                        onChange={handleFileUpload}
                        disabled={uploadingMedia || isUploadDisabled}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {uploadingMedia ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7] mb-3"></div>
                            <p className="text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600 font-medium">
                              {isUploadDisabled ? 'Maximum images reached' : 'Click to upload photos'}
                            </p>
                            {!isUploadDisabled && (
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, WebP, or GIF (max 5MB each)
                              </p>
                            )}
                          </>
                        )}
                      </label>
                    </div>

                    {/* Uploaded Media Preview */}
                    {uploadedMedia.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {uploadedMedia.map((media, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={media.url}
                              alt="Uploaded"
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
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
              </div>

              {/* Budget Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">4</span>
                  </div>
                  Budget
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Budget ($) *
                    </label>
                    <input
                      type="number"
                      name="budgetMin"
                      value={form.budgetMin}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="500"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Budget ($) *
                    </label>
                    <input
                      type="number"
                      name="budgetMax"
                      value={form.budgetMax}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="1000"
                      required
                      min="0"
                    />
                  </div>
                </div>
                {form.budgetMin && form.budgetMax && !validateBudget(form.budgetMin, form.budgetMax) && (
                  <div className="pl-0 md:pl-10 mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
                      <p className="text-sm text-gray-700">
                        Budget range: <span className="font-semibold text-green-700">${Number(form.budgetMin).toLocaleString()} - ${Number(form.budgetMax).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Timeline Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">5</span>
                  </div>
                  Location & Timeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={form.postcode}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="A1A 1A1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="Toronto"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      required
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
                      Project Stage *
                    </label>
                    <select
                      name="jobStage"
                      value={form.jobStage}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      required
                    >
                      <option value="READY_TO_HIRE">Ready to hire</option>
                      <option value="PLANNING">Planning</option>
                      <option value="INSURANCE_WORK">Insurance work</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#1149C7] font-bold">6</span>
                  </div>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-10">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={form.contactName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="(416) 123-4567"
                    />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1149C7] focus:border-[#1149C7] transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Submit Section */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 bg-[#1149C7] hover:bg-[#0d38a0] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}