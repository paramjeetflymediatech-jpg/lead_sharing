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
//   const status = searchParams.get("status");

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

//       const userRes = await fetch("/api/profile", { credentials: "include" });
//       if (userRes.ok) {
//         const userData = await userRes.json();
//         setUser(userData.data);
//       }

//       let url = "/api/homeowner/my-jobs";
//       if (status) url += `?status=${status}`;

//       const jobsRes = await fetch(url, {
//         credentials: "include",
//         headers: { "Content-Type": "application/json" }
//       });

//       if (jobsRes.ok) {
//         const data = await jobsRes.json();
//         setJobs(data.data?.jobs || []);
//         setSummary(data.data?.summary || summary);
//       }
//     } catch (e) {
//       console.error(e);
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
//         method: "DELETE",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "x-user-id": userId.toString(),
//           "x-user-role": "HOMEOWNER"
//         }
//       });

//       const data = await response.json();
//       toast.dismiss(loadingToast);

//       if (response.ok) {
//         toast.success(data.message);
//         await fetchData();
//         closeDeleteModal();
//       } else {
//         toast.error(data.message || "Failed to delete job");
//       }
//     } catch (e) {
//       toast.dismiss(loadingToast);
//       toast.error("Delete failed");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const formatStatus = (s) =>
//     ({ OPEN: "Open", HIRED: "Hired", COMPLETED: "Completed", CANCELLED: "Cancelled", PENDING: "Pending" }[s] || s);

//   const formatDate = (d) =>
//     new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

//   const canEditJob = (job) => ["OPEN", "PENDING"].includes(job.status);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
//         <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

//           {/* Header */}
//           <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
//                 My Posted Jobs
//               </h1>
//               <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400">
//                 Manage all your home project jobs and quotes
//               </p>
//             </div>

//             <Link
//               href="/jobs"
//               className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl shadow-lg"
//             >
//               <PlusIcon className="h-5 w-5 mr-2" />
//               Post New Job
//             </Link>
//           </div>

//           {/* Tabs */}
//           <div className="border-b mb-6 overflow-x-auto">
//             <nav className="flex gap-6 whitespace-nowrap text-sm font-medium">
//               {["", "OPEN", "HIRED", "COMPLETED", "CANCELLED"].map((s) => (
//                 <Link
//                   key={s || "ALL"}
//                   href={`/homeowner/jobs${s ? `?status=${s}` : ""}`}
//                   className={`py-3 border-b-2 ${status === s || (!status && !s)
//                     ? "border-blue-600 text-blue-600"
//                     : "border-transparent text-gray-500"
//                     }`}
//                 >
//                   {s || "All Jobs"}
//                 </Link>
//               ))}
//             </nav>
//           </div>

//           {/* Jobs */}
//           <div className="space-y-6">
//             {jobs.length > 0 ? (
//               jobs.map((job) => (
//                 <div key={job._id} className="bg-white dark:bg-zinc-800 rounded-2xl p-5 sm:p-6 shadow">
//                   <div className="flex flex-col lg:flex-row gap-6 justify-between">
//                     <div className="flex-1">
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         <span className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
//                           {job.category?.name}
//                         </span>
//                         <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
//                           {formatStatus(job.status)}
//                         </span>
//                       </div>

//                       <h3 className="text-lg sm:text-xl font-bold">
//                         {job.subCategory?.name}
//                       </h3>

//                       <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 line-clamp-2">
//                         {job.description}
//                       </p>

//                       <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500 mt-4">
//                         <span>📍 {job.location?.city}</span>
//                         <span>📅 {formatDate(job.createdAt)}</span>
//                         <span>💰 ₹{job.budgetMin} - ₹{job.budgetMax}</span>
//                         <span className="font-semibold text-blue-600">
//                           💬 {job.leadCount} Quotes
//                         </span>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-auto">
//                       <Link
//                         href={`/homeowner/jobs/${job._id}`}
//                         className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold flex items-center gap-2"
//                       >
//                         <EyeIcon className="h-4 w-4" /> View
//                       </Link>

//                       {canEditJob(job) && (
//                         <Link
//                           href={`/homeowner/jobs/${job._id}/edit`}
//                           className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold flex items-center gap-2"
//                         >
//                           <PencilIcon className="h-4 w-4" /> Edit
//                         </Link>
//                       )}

//                       <button
//                         onClick={() => openDeleteModal(job)}
//                         className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2"
//                       >
//                         <TrashIcon className="h-4 w-4" /> Delete
//                       </button>
//                     </div>
//                   </div>

//                   {job.leadCount > 0 && job.status === "OPEN" && (
//                     <Link
//                       href={`/homeowner/jobs/${job._id}#quotes`}
//                       className="mt-4 block w-full text-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white rounded-xl font-bold"
//                     >
//                       <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
//                       View Quotes
//                     </Link>
//                   )}
//                 </div>
//               ))
//             ) : summary.totalJobs === 0 ? (
//               /* Case 1: No jobs created at all */
//               <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700">
//                 <div className="text-7xl mb-6">📋</div>
//                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                   No Jobs Posted Yet
//                 </h3>
//                 <p className="text-gray-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
//                   Post your first job to start receiving quotes from local trusted tradespeople.
//                 </p>
//                 <Link
//                   href="/jobs"
//                   className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                 >
//                   <PlusIcon className="h-5 w-5 mr-2" />
//                   Post New Job
//                 </Link>
//               </div>
//             ) : (
//               /* Case 2: Filtered view is empty, but user has other jobs */
//               <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-700">
//                 <div className="text-5xl mb-4 grayscale opacity-50">📋</div>
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                   No {(formatStatus(status) || "matching").toLowerCase()} jobs found
//                 </h3>
//                 <p className="text-gray-500 dark:text-zinc-400">
//                   You don't have any jobs in the "{formatStatus(status) || 'selected'}" status right now.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

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
                  className={`py-3 border-b-2 ${status === s || (!status && !s)
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
            {jobs.length > 0 ? (
              jobs.map((job) => (
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
              ))
            ) : summary.totalJobs === 0 ? (
              /* Case 1: No jobs created at all */
              <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700">
                <div className="text-7xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No Jobs Posted Yet
                </h3>
                <p className="text-gray-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                  Post your first job to start receiving quotes from local trusted tradespeople.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Post New Job
                </Link>
              </div>
            ) : (
              /* Case 2: Filtered view is empty, but user has other jobs */
              <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-700">
                <div className="text-5xl mb-4 grayscale opacity-50">📋</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No {(formatStatus(status) || "matching").toLowerCase()} jobs found
                </h3>
                <p className="text-gray-500 dark:text-zinc-400">
                  You don't have any jobs in the "{formatStatus(status) || 'selected'}" status right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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