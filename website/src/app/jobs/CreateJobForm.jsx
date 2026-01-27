"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function JobCreationForm({ user }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [uploadedMedia, setUploadedMedia] = useState([]);

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
  });

  // Fetch categories and subcategories on mount
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
      style: {
        padding: "16px",
        borderRadius: "10px",
        fontSize: "16px",
      },
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
        duration: 3000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "📁",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(uploadingToast);
      toast.error("Upload failed. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "❌",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔥 SUBMIT CLICKED");
    console.log("👤 User object:", user);

    // Check if user is logged in
    const userId = user?._id || user?.id || user?.userId;
    const userRole = user?.role;
    
    if (!userId) {
      toast.error("Please log in first to create a job", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "🔒",
      });
      
      // Redirect to login page after 1.5 seconds
      setTimeout(() => {
        router.push("auth/login");
      }, 1500);
      return;
    }

    // Check if user role is HOMEOWNER
    if (userRole !== "HOMEOWNER") {
      toast.error("Only homeowners can create jobs", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "⚠️",
      });
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    const payload = {
      homeowner: userId,
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
    };

    console.log("📦 PAYLOAD:", payload);

    try {
      setLoading(true);

      // Show loading toast
      const loadingToast = toast.loading("Creating your job...", {
        position: "top-center",
        style: {
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
      });

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("🌐 RESPONSE STATUS:", res.status);

      const data = await res.json();
      console.log("✅ RESPONSE DATA:", data);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error(data.message);

      // Show success toast
      toast.success("🎉 Job created successfully!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "600",
        },
        icon: "✅",
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
      });
      setUploadedMedia([]);
      setCurrentStep(1);

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err) {
      console.error("❌ ERROR:", err);
      
      // Show error toast
      toast.error(err.message || "Failed to create job. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "❌",
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
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Leadsharing</span>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold">{user?.email || "Loading..."}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep === 5 ? "Final step" : `${5 - currentStep} steps left`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  What type of job is it?
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of tradesperson do you need?
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Please select</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What type of job is it?
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    >
                      <option value="">Please select</option>
                      {filteredSubCategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Ownership */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Are you the owner or authorised to make property changes?
                </h2>

                <div className="space-y-3">
                  {[
                    { value: "OWNER", label: "I own and live at this property" },
                    { value: "LANDLORD", label: "I am the landlord" },
                    { value: "AUTHORIZED", label: "I rent, but am authorised to make changes to this property" },
                    { value: "BUYING", label: "I am looking to buy this property" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        form.ownership === option.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ownership"
                        value={option.value}
                        checked={form.ownership === option.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Describe what needs to be done
                </h2>

                <div>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Include any details you think the tradesperson should know."
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-2">
                    At least 25 characters please ({form.description.length}/25)
                  </p>
                </div>

                {/* Media Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add photos or videos (optional)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      type="file"
                      id="media-upload"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                    <label
                      htmlFor="media-upload"
                      className={`cursor-pointer ${uploadingMedia ? 'opacity-50' : ''}`}
                    >
                      {uploadingMedia ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                          <p className="text-blue-600 font-medium">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Images or videos (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Uploaded Media Preview */}
                  {uploadedMedia.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {uploadedMedia.map((media, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            {media.type === "IMAGE" ? (
                              <img
                                src={media.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Roughly, what's your budget?
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-blue-900">
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
                      placeholder="e.g., 100"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
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
                      placeholder="e.g., 500"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Location & Additional Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Job details
                </h2>
                <p className="text-gray-600 mb-6">
                  Provide additional information about when you need the work done and where it will take place.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where will the job take place? *
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={form.postcode}
                    onChange={handleChange}
                    placeholder="Enter postcode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
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
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    What stage is your project at? *
                  </label>
                  <select
                    name="jobStage"
                    value={form.jobStage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="READY_TO_HIRE">Ready to hire</option>
                    <option value="PLANNING">Planning</option>
                    <option value="INSURANCE">Insurance work</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`ml-auto px-8 py-3 rounded-lg font-semibold transition ${
                    canProceed()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canProceed()}
                  className={`ml-auto px-8 py-3 rounded-lg font-semibold transition ${
                    loading || !canProceed()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Creating..." : "Submit Job"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}