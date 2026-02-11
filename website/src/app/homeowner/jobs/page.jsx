// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import {
//   PlusIcon,
//   ChatBubbleLeftRightIcon,
//   PencilIcon,
//   TrashIcon,
//   EyeIcon
// } from "@heroicons/react/24/outline";
// import { toast, Toaster } from "react-hot-toast";

// export default function HomeownerJobsPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const status = searchParams.get('status');

//   const [user, setUser] = useState({});
//   const [jobs, setJobs] = useState([]);
//   const [summary, setSummary] = useState({
//     totalJobs: 0,
//     activeJobs: 0,
//     hiredJobs: 0,
//     completedJobs: 0,
//     cancelledJobs: 0,
//     totalLeads: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [jobToDelete, setJobToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, [status]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       // Fetch user profile
//       const userRes = await fetch("/api/profile", {
//         credentials: "include"
//       });
//       if (userRes.ok) {
//         const userData = await userRes.json();
//         setUser(userData.data);
//       }

//       // Fetch jobs
//       let url = "/api/homeowner/my-jobs";
//       if (status) {
//         url += `?status=${status}`;
//       }

//       const jobsRes = await fetch(url, {
//         credentials: "include",
//         headers: { "Content-Type": "application/json" }
//       });

//       if (jobsRes.ok) {
//         const data = await jobsRes.json();
//         setJobs(data.data?.jobs || []);
//         setSummary(data.data?.summary || summary);
//       } else {
//         console.error("Failed to fetch jobs:", jobsRes.status);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDeleteModal = (job) => {
//     setJobToDelete(job);
//     setDeleteModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setDeleteModalOpen(false);
//     setJobToDelete(null);
//   };

//   const handleDeleteJob = async () => {
//     if (!jobToDelete || !user) return;

//     setDeleting(true);
//     const userId = user._id || user.id;
//     const loadingToast = toast.loading("Deleting job...");

//     try {
//       const response = await fetch(`/api/jobs/homeowner/${jobToDelete._id}`, {
//         method: 'DELETE',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-id': userId.toString(),
//           'x-user-role': 'HOMEOWNER'
//         }
//       });

//       const data = await response.json();
//       toast.dismiss(loadingToast);

//       if (response.ok) {
//         toast.success("✅ " + data.message);
//         await fetchData();
//         closeDeleteModal();
//       } else {
//         toast.error(data.message || 'Failed to delete job');
//       }
//     } catch (error) {
//       console.error('Error deleting job:', error);
//       toast.dismiss(loadingToast);
//       toast.error('An error occurred while deleting the job');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const formatStatus = (status) => {
//     const statusMap = {
//       'OPEN': 'Open',
//       'HIRED': 'Hired',
//       'COMPLETED': 'Completed',
//       'CANCELLED': 'Cancelled',
//       'PENDING': 'Pending'
//     };
//     return statusMap[status] || status;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric'
//       });
//     } catch (e) {
//       return '';
//     }
//   };

//   const getStatusCount = (statusType) => {
//     return jobs.filter(j => j.status === statusType).length;
//   };

//   const canEditJob = (job) => {
//     return ['OPEN', 'PENDING'].includes(job.status);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                   My Posted Jobs
//                 </h1>
//                 <p className="mt-2 text-gray-600 dark:text-zinc-400">
//                   Manage all your home project jobs and quotes
//                 </p>
//               </div>
//               <Link
//                 href="/jobs"
//                 className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//               >
//                 <PlusIcon className="h-5 w-5 mr-2" />
//                 Post New Job
//               </Link>
//             </div>
//           </div>

//           {/* Status Filter Tabs */}
//           <div className="mb-6 border-b border-gray-200 dark:border-zinc-700">
//             <nav className="-mb-px flex space-x-8 overflow-x-auto">
//               <Link
//                 href="/homeowner/jobs"
//                 className={`${!status
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                   } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 All Jobs ({summary.totalJobs})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=OPEN"
//                 className={`${status === 'OPEN'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                   } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Open ({summary.activeJobs || getStatusCount('OPEN')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=HIRED"
//                 className={`${status === 'HIRED'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                   } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Hired ({summary.hiredJobs || getStatusCount('HIRED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=COMPLETED"
//                 className={`${status === 'COMPLETED'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                   } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Completed ({summary.completedJobs || getStatusCount('COMPLETED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=CANCELLED"
//                 className={`${status === 'CANCELLED'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                   } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Cancelled ({summary.cancelledJobs || getStatusCount('CANCELLED')})
//               </Link>
//             </nav>
//           </div>

//           {/* Jobs List */}
//           <div className="space-y-6">
//             {jobs.length > 0 ? (
//               <div className="grid gap-6">
//                 {jobs.map((job) => (
//                   <div
//                     key={job._id}
//                     className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-zinc-700"
//                   >
//                     <div className="flex flex-col md:flex-row items-start justify-between gap-4">
//                       <div className="flex-1">
//                         {/* Job Header */}
//                         <div className="flex flex-wrap items-center gap-3 mb-3">
//                           <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm font-semibold rounded-full">
//                             {job.category?.name || 'Category'}
//                           </span>
//                           <span className={`px-4 py-1 text-sm font-semibold rounded-full ${job.status === 'OPEN'
//                             ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
//                             : job.status === 'HIRED'
//                               ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
//                               : job.status === 'COMPLETED'
//                                 ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
//                                 : job.status === 'CANCELLED'
//                                   ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
//                                   : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20'
//                             }`}>
//                             {formatStatus(job.status)}
//                           </span>
//                         </div>

//                         {/* Job Title */}
//                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                           {job.subCategory?.name || 'Job'}
//                         </h3>

//                         {/* Job Description */}
//                         <p className="text-gray-600 dark:text-zinc-400 mb-4 line-clamp-2">
//                           {job.description || 'No description provided'}
//                         </p>

//                         {/* Job Details */}
//                         <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-500">
//                           <span className="flex items-center">
//                             📍 {job.location?.city || 'Not specified'} • {job.location?.postcode || 'N/A'}
//                           </span>
//                           <span className="flex items-center">
//                             📅 Posted: {formatDate(job.createdAt)}
//                           </span>
//                           <span className="flex items-center">
//                             💰 ₹{job.budgetMin || '0'} - ₹{job.budgetMax || 'Negotiable'}
//                           </span>
//                           {job.leadCount !== undefined && (
//                             <span className="flex items-center font-semibold text-blue-600">
//                               💬 {job.leadCount} Quotes
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex flex-row md:flex-col flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0 md:ml-4 justify-end">
//                         {/* View Button */}
//                         <Link
//                           href={`/homeowner/jobs/${job._id}`}
//                           className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-all"
//                           title="View Details"
//                         >
//                           <EyeIcon className="h-4 w-4" />
//                           <span className="text-sm font-semibold">View</span>
//                         </Link>

//                         {/* Edit Button */}
//                         {canEditJob(job) && (
//                           <Link
//                             href={`/homeowner/jobs/${job._id}/edit`}
//                             className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all"
//                             title="Edit Job"
//                           >
//                             <PencilIcon className="h-4 w-4" />
//                             <span className="text-sm font-semibold">Edit</span>
//                           </Link>
//                         )}

//                         {/* Delete Button */}
//                         <button
//                           onClick={() => openDeleteModal(job)}
//                           className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
//                           title="Delete Job"
//                         >
//                           <TrashIcon className="h-4 w-4" />
//                           <span className="text-sm font-semibold">Delete</span>
//                         </button>
//                       </div>
//                     </div>

//                     {/* Bottom Action Button */}
//                     {
//                       job.leadCount > 0 && job.status === 'OPEN' && (
//                         <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
//                           <Link
//                             href={`/homeowner/jobs/${job._id}#quotes`}
//                             className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                           >
//                             <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
//                             View {job.leadCount} Quote{job.leadCount !== 1 ? 's' : ''}
//                           </Link>
//                         </div>
//                       )
//                     }
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg">
//                 <div className="text-6xl mb-4">📋</div>
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                   {status ? `No ${formatStatus(status)} jobs found` : 'No jobs posted yet'}
//                 </h3>
//                 <p className="text-gray-600 dark:text-zinc-400 mb-6">
//                   {status
//                     ? `You don't have any ${formatStatus(status).toLowerCase()} jobs.`
//                     : 'Post your first job to start receiving quotes from local trusted tradespeople.'
//                   }
//                 </p>
//                 <Link
//                   href="/jobs"
//                   className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                 >
//                   <PlusIcon className="h-5 w-5 mr-2" />
//                   Post New Job
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div >

//       {/* Delete Confirmation Modal */}
//       {
//         deleteModalOpen && jobToDelete && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
//               <div className="text-center">
//                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
//                   <TrashIcon className="h-8 w-8 text-red-600" />
//                 </div>

//                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                   Delete This Job?
//                 </h3>

//                 <div className="mb-6">
//                   <p className="text-gray-600 dark:text-zinc-400 mb-2">
//                     Are you sure you want to delete
//                   </p>
//                   <p className="font-bold text-gray-900 dark:text-white text-lg">
//                     "{jobToDelete.subCategory?.name || 'this job'}"?
//                   </p>
//                 </div>

//                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
//                   <p className="text-sm text-yellow-800 dark:text-yellow-200">
//                     ⚠️ This action cannot be undone
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <button
//                     onClick={closeDeleteModal}
//                     disabled={deleting}
//                     className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleDeleteJob}
//                     disabled={deleting}
//                     className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                   >
//                     {deleting ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         Deleting...
//                       </>
//                     ) : (
//                       <>
//                         <TrashIcon className="h-5 w-5" />
//                         Delete Job
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )
//       }
//     </>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { toast, Toaster } from "react-hot-toast";

export default function HomeownerJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [user, setUser] = useState({});
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({
    totalJobs: 0,
    activeJobs: 0,
    hiredJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const userRes = await fetch("/api/profile", { credentials: "include" });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
      }

      let url = "/api/homeowner/my-jobs";
      if (status) url += `?status=${status}`;

      const jobsRes = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.data?.jobs || []);
        setSummary(data.data?.summary || summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete || !user) return;

    setDeleting(true);
    const userId = user._id || user.id;
    const loadingToast = toast.loading("Deleting job...");

    try {
      const response = await fetch(`/api/jobs/homeowner/${jobToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId.toString(),
          "x-user-role": "HOMEOWNER"
        }
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success(data.message);
        await fetchData();
        closeDeleteModal();
      } else {
        toast.error(data.message || "Failed to delete job");
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const formatStatus = (s) =>
    ({ OPEN: "Open", HIRED: "Hired", COMPLETED: "Completed", CANCELLED: "Cancelled", PENDING: "Pending" }[s] || s);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const canEditJob = (job) => ["OPEN", "PENDING"].includes(job.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                My Posted Jobs
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400">
                Manage all your home project jobs and quotes
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Post New Job
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6 overflow-x-auto">
            <nav className="flex gap-6 whitespace-nowrap text-sm font-medium">
              {["", "OPEN", "HIRED", "COMPLETED", "CANCELLED"].map((s) => (
                <Link
                  key={s || "ALL"}
                  href={`/homeowner/jobs${s ? `?status=${s}` : ""}`}
                  className={`py-3 border-b-2 ${
                    status === s || (!status && !s)
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {s || "All Jobs"}
                </Link>
              ))}
            </nav>
          </div>

          {/* Jobs */}
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white dark:bg-zinc-800 rounded-2xl p-5 sm:p-6 shadow">

                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                        {job.category?.name}
                      </span>
                      <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
                        {formatStatus(job.status)}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold">
                      {job.subCategory?.name}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500 mt-4">
                      <span>📍 {job.location?.city}</span>
                      <span>📅 {formatDate(job.createdAt)}</span>
                      <span>💰 ₹{job.budgetMin} - ₹{job.budgetMax}</span>
                      <span className="font-semibold text-blue-600">
                        💬 {job.leadCount} Quotes
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-auto">
                    <Link
                      href={`/homeowner/jobs/${job._id}`}
                      className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" /> View
                    </Link>

                    {canEditJob(job) && (
                      <Link
                        href={`/homeowner/jobs/${job._id}/edit`}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" /> Edit
                      </Link>
                    )}

                    <button
                      onClick={() => openDeleteModal(job)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>

                {job.leadCount > 0 && job.status === "OPEN" && (
                  <Link
                    href={`/homeowner/jobs/${job._id}#quotes`}
                    className="mt-4 block w-full text-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white rounded-xl font-bold"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
                    View Quotes
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Modal (UNCHANGED LOGIC) */}
      {/* {deleteModalOpen && jobToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Job?</h3>
            <p className="mb-6">{jobToDelete.subCategory?.name}</p>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 border rounded-xl py-2">
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white rounded-xl py-2"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )} */}

       {
        deleteModalOpen && jobToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Delete This Job?
                </h3>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-zinc-400 mb-2">
                    Are you sure you want to delete
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    "{jobToDelete.subCategory?.name || 'this job'}"?
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This action cannot be undone
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteJob}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-5 w-5" />
                        Delete Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}