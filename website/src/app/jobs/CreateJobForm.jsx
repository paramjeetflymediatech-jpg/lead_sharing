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
    contactName: "",
    contactPhone: "",
    contactEmail: "",
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

  // Pre-fill contact info from user data
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        contactName: user.name || "",
        contactPhone: user.phone || "",
        contactEmail: user.email || "",
      }));
    }
  }, [user]);

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
    setCurrentStep((prev) => Math.min(prev + 1, 6));
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
        router.push("/auth/login");
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: send cookies with request
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
        contactName: user?.name || "",
        contactPhone: user?.phone || "",
        contactEmail: user?.email || "",
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
      case 6:
        return form.contactName && form.contactPhone && form.contactEmail;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      {/* Toast Notifications */}
      <Toaster />

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            L
          </div>
          <div>
            <h1 className="font-bold text-gray-800">Leadsharing</h1>
            <p className="text-sm text-gray-500">
              Logged in as: {user?.email || "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-6">
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
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                What type of job is it?
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of tradesperson do you need? Please select
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, category: cat._id }))
                      }
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        form.category === cat._id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {form.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of job is it? Please select
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredSubCategories.map((sub) => (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, subCategory: sub._id }))
                        }
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          form.subCategory === sub._id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                  {
                    value: "AUTHORIZED",
                    label:
                      "I rent, but am authorised to make changes to this property",
                  },
                  {
                    value: "BUYING",
                    label: "I am looking to buy this property",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, ownership: option.value }))
                    }
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      form.ownership === option.value
                        ? "border-blue-600 bg-blue-50"
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
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Describe the work you need done..."
              />

              {/* Media Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add photos or videos (optional)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
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

                {/* Uploaded Media Preview */}
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
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Location & Additional Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Job details
                </h2>
                <p className="text-sm text-gray-500">
                  Provide additional information about when you need the work done
                  and where it will take place.
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="John Doe"
                  required
                />
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="+44 7700 900000"
                  required
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Note:</span> Your contact information will only be visible to tradespeople who purchase your job lead. This helps them get in touch with you directly.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
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
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next step →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canProceed() || loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Submit Job"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}