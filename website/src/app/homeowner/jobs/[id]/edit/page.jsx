"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast, Toaster } from "react-hot-toast";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    description: '',
    location: {
      postcode: '',
      city: ''
    },
    startTime: '',
    jobStage: '',
    ownership: '',
    budgetMin: '',
    budgetMax: '',
    media: [],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    status: 'OPEN'
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [originalStatus, setOriginalStatus] = useState('');

  // Load user and job details
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch user
        const userRes = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!userRes.ok) {
          toast.error("Please login to continue");
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        const userId = userData?._id || userData?.id || userData?.user?._id;
        
        if (!userId) {
          toast.error("Please login to continue");
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }

        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          console.log("Categories API Response:", catData);
          
          if (Array.isArray(catData)) {
            setCategories(catData);
          } else if (catData.data && Array.isArray(catData.data)) {
            setCategories(catData.data);
          } else if (catData.categories && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
          } else {
            setCategories([]);
          }
        }

        // Fetch job details
        if (jobId) {
          const jobRes = await fetch(`/api/jobs/homeowner/${jobId}`, {
            credentials: "include",
            headers: {
              'x-user-id': userId.toString(),
              'x-user-role': 'HOMEOWNER'
            }
          });

          if (jobRes.status === 403 || jobRes.status === 401) {
            const errorData = await jobRes.json();
            toast.error(errorData.message);
            setTimeout(() => router.push("/homeowner/jobs"), 2000);
            return;
          }

          if (jobRes.ok) {
            const jobData = await jobRes.json();
            console.log("Job API Response (Full):", jobData);
            setJobDetails(jobData);
            setOriginalStatus(jobData.status); // Save original status

            // Check if job can be edited
            const editableStatuses = ['OPEN', 'PENDING', 'HIRED'];
            if (!editableStatuses.includes(jobData.status)) {
              toast.error(`Cannot edit jobs with status: ${jobData.status}. Only OPEN, PENDING, and HIRED jobs can be edited.`);
              setTimeout(() => router.push(`/homeowner/jobs/${jobId}`), 2000);
              return;
            }

            // Extract category and subCategory IDs correctly
            const categoryId = jobData.category?._id || jobData.category || '';
            const subCategoryId = jobData.subCategory?._id || jobData.subCategory || '';

            // Map the response to form data
            const updatedFormData = {
              category: categoryId,
              subCategory: subCategoryId,
              description: jobData.description || '',
              location: {
                postcode: jobData.location?.postcode || jobData.postcode || '',
                city: jobData.location?.city || jobData.city || ''
              },
              startTime: jobData.startTime || jobData.start_time || '',
              jobStage: jobData.jobStage || jobData.job_stage || '',
              ownership: jobData.ownership || '',
              budgetMin: jobData.budgetMin || jobData.budget_min || '',
              budgetMax: jobData.budgetMax || jobData.budget_max || '',
              media: Array.isArray(jobData.media) ? jobData.media : [],
              contactName: jobData.contactName || jobData.contact_name || '',
              contactPhone: jobData.contactPhone || jobData.contact_phone || '',
              contactEmail: jobData.contactEmail || jobData.contact_email || '',
              status: jobData.status || 'OPEN'
            };

            console.log("Mapped Form Data:", updatedFormData);
            setFormData(updatedFormData);

            // Fetch subcategories if category exists
            if (categoryId) {
              const subRes = await fetch(`/api/subcategories?categoryId=${categoryId}`);
              if (subRes.ok) {
                const subData = await subRes.json();
                console.log("Subcategories API Response:", subData);
                
                if (Array.isArray(subData)) {
                  setSubCategories(subData);
                } else if (subData.data && Array.isArray(subData.data)) {
                  setSubCategories(subData.data);
                } else if (subData.subCategories && Array.isArray(subData.subCategories)) {
                  setSubCategories(subData.subCategories);
                } else {
                  setSubCategories([]);
                }
              }
            }
          } else {
            const errorData = await jobRes.json();
            setError(errorData.message || "Failed to load job details");
            toast.error(errorData.message || "Failed to load job");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("An error occurred while loading the job");
        toast.error("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobId, router]);

  const fetchSubCategories = async (categoryId) => {
    try {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }
      
      const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Fetch Subcategories Response:", data);
        
        if (Array.isArray(data)) {
          setSubCategories(data);
        } else if (data.data && Array.isArray(data.data)) {
          setSubCategories(data.data);
        } else if (data.subCategories && Array.isArray(data.subCategories)) {
          setSubCategories(data.subCategories);
        } else {
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subCategory: ''
    }));
    
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const userId = user?._id || user?.id || user?.user?._id;

    const loadingToast = toast.loading("Updating job...");

    try {
      console.log("Submitting update:", formData);
      
      const res = await fetch(`/api/jobs/homeowner/${jobId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
          'x-user-role': 'HOMEOWNER'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("Update response:", data);

      toast.dismiss(loadingToast);

      if (res.ok) {
        setSuccess("Job updated successfully!");
        toast.success("✅ Job updated successfully!");
        setTimeout(() => {
          router.push(`/homeowner/jobs/${jobId}`);
        }, 1500);
      } else {
        setError(data.message || 'Failed to update job');
        toast.error(data.message || 'Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setError('An error occurred while updating the job');
      toast.dismiss(loadingToast);
      toast.error('An error occurred while updating the job');
    } finally {
      setSubmitting(false);
    }
  };

  // Media upload and remove functions
  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formDataObj = new FormData();
    for (let i = 0; i < files.length; i++) {
      formDataObj.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, ...data.files]
        }));
        toast.success('Media uploaded successfully');
      } else {
        toast.error(data.message || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  // Get available status options based on current status
  const getAvailableStatusOptions = () => {
    if (originalStatus === 'OPEN') {
      return [
        { value: 'OPEN', label: 'Open' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ];
    } else if (originalStatus === 'PENDING') {
      return [
        { value: 'PENDING', label: 'Pending' },
        { value: 'OPEN', label: 'Open' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ];
    } else if (originalStatus === 'HIRED') {
      return [
        { value: 'HIRED', label: 'Hired' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ];
    }
    return [{ value: originalStatus, label: originalStatus }];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/homeowner/jobs/${jobId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Job Details
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Job
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-400">
              Update your job details
            </p>
            {jobDetails && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Job ID: {jobId} | Status: <span className="font-semibold">{formData.status}</span> | Created: {new Date(jobDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 space-y-6">
            
            {/* Job Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Job Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {getAvailableStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {originalStatus === 'HIRED' && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  💡 You can mark this job as "Completed" when the work is finished
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Subcategory *
              </label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                required
                disabled={!formData.category || subCategories.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Select a subcategory</option>
                {subCategories.map((subCat) => (
                  <option key={subCat.id || subCat._id} value={subCat.id || subCat._id}>
                    {subCat.name}
                  </option>
                ))}
              </select>
              {formData.category && subCategories.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  Loading subcategories...
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your job in detail..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  name="location.postcode"
                  value={formData.location.postcode}
                  onChange={handleChange}
                  required
                  placeholder="Enter postcode"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Start Time *
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select timeframe</option>
                <option value="ASAP">ASAP</option>
                <option value="WITHIN_A_WEEK">Within a week</option>
                <option value="WITHIN_2_WEEKS">Within 2 weeks</option>
                <option value="WITHIN_A_MONTH">Within a month</option>
                <option value="MORE_THAN_A_MONTH">More than a month</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            {/* Job Stage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Job Stage *
              </label>
              <select
                name="jobStage"
                value={formData.jobStage}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select stage</option>
                <option value="PLANNING">Planning</option>
                <option value="READY_TO_START">Ready to start</option>
                <option value="READY_TO_HIRE">Ready to hire</option>
                <option value="IN_PROGRESS">In progress</option>
              </select>
            </div>

            {/* Ownership */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Property Ownership *
              </label>
              <select
                name="ownership"
                value={formData.ownership}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select ownership</option>
                <option value="OWNER">Owner</option>
                <option value="TENANT">Tenant</option>
                <option value="LANDLORD">Landlord</option>
              </select>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Minimum Budget (₹)
                </label>
                <input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Maximum Budget (₹)
                </label>
                <input
                  type="number"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Media (Photos/Documents)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-xl p-6">
                <input
                  type="file"
                  multiple
                  onChange={handleMediaUpload}
                  className="w-full"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                  Upload photos or documents related to the job
                </p>
              </div>
              
              {/* Media Preview */}
              {formData.media.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.media.map((media, index) => (
                    <div key={index} className="relative border rounded-lg overflow-hidden">
                      {media.type === 'IMAGE' || media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img 
                          src={media.url} 
                          alt={`Media ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-zinc-400">Document</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    placeholder="+91 1234567890"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info (Read-only) */}
            {jobDetails && (
              <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Additional Information (Read-only)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-zinc-400">Created Date</p>
                    <p className="font-medium">{new Date(jobDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-zinc-400">Job ID</p>
                    <p className="font-medium">{jobId}</p>
                  </div>
                  {jobDetails.leadCount !== undefined && (
                    <div>
                      <p className="text-gray-600 dark:text-zinc-400">Leads Received</p>
                      <p className="font-medium">{jobDetails.leadCount} / {jobDetails.maxLeads || 3}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href={`/homeowner/jobs/${jobId}`}
                className="flex-1 text-center px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}