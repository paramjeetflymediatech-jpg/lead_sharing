"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function HomeownerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user profile - THIS IS THE FIX for showing user name
      const userRes = await fetch("/api/profile", {
        credentials: "include"
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
        console.log("User data loaded:", userData.data);
      }

      // Fetch jobs
      const jobsRes = await fetch("/api/homeowner/my-jobs", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.data?.jobs || []);
        setSummary(data.data?.summary || summary);
      } else {
        console.error("Failed to fetch jobs:", jobsRes.status);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return formatDate(dateString);
    } catch (e) {
      return '';
    }
  };

  const recentJobs = jobs.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'Homeowner'}!</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">Track your projects and manage quotes from professionals.</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center px-5 py-3 bg-[#1149C7] text-white text-sm font-bold rounded-xl hover:bg-[#155DFC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-[#1149C7]" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total Jobs</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{summary.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{summary.activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Quotes</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{summary.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1149C7] to-[#155DFC] rounded-3xl p-6 shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-100 uppercase tracking-widest">Status</p>
              <p className="text-xl font-black text-white">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sans">Recent Jobs</h2>
              <Link href="/homeowner/jobs" className="text-sm font-bold text-[#1149C7] hover:underline">View All</Link>
            </div>
            <div className="p-6">
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job._id}
                      className="group border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#1149C7] uppercase tracking-widest mb-1">{job.category?.name}</p>
                          <h3 className="font-bold text-zinc-900 dark:text-white">{job.subCategory?.name}</h3>
                          <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-bold text-zinc-400">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                              {job.location?.city}
                            </div>
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {formatStatus(job.status)}
                            </div>
                            <div className="flex items-center gap-1.5 leading-none">
                              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                              {job.leadCount} Quotes
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/homeowner/jobs/${job._id}`}
                          className="self-start sm:self-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-black/5"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-500 font-bold tracking-tight">No active jobs found</p>
                  <Link href="/jobs" className="mt-4 inline-block text-[#1149C7] font-bold text-sm">Post one now →</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500 tracking-widest uppercase">Open Jobs</span>
                <span className="text-green-500">{summary.activeJobs}</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(summary.activeJobs / Math.max(summary.totalJobs, 1)) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-sm font-bold mt-6">
                <span className="text-zinc-500 tracking-widest uppercase">Completion Rate</span>
                <span className="text-purple-500">
                  {summary.totalJobs > 0
                    ? Math.round((summary.completedJobs / summary.totalJobs) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${summary.totalJobs > 0 ? (summary.completedJobs / summary.totalJobs) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#1149C7] opacity-20 rounded-full blur-3xl group-hover:blur-2xl transition-all" />
            <h3 className="text-lg font-bold mb-2">Need a Pro?</h3>
            <p className="text-sm text-zinc-400 mb-6 font-medium leading-relaxed">The fastest way to get your project done accurately.</p>
            <Link
              href="/jobs"
              className="flex items-center justify-center gap-2 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-100 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Post New Job
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

}








// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { PlusIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

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
//         headers: {
//           "Content-Type": "application/json"
//         }
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

//   const formatStatus = (status) => {
//     const statusMap = {
//       'OPEN': 'Open',
//       'HIRED': 'Hired',
//       'COMPLETED': 'Completed',
//       'CANCELLED': 'Cancelled'
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

//   // Calculate counts for each status
//   const getStatusCount = (statusType) => {
//     return jobs.filter(j => j.status === statusType).length;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading jobs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Posted Jobs</h1>
//           <p className="text-gray-600 dark:text-zinc-400 mt-2">Manage all your home project jobs and quotes</p>
//         </div>
//         <Link
//           href="/jobs"
//           className="inline-flex items-center px-5 py-3 bg-[#1149C7] text-white text-sm font-bold rounded-xl hover:bg-[#155DFC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition-all"
//         >
//           <PlusIcon className="h-5 w-5 mr-2" />
//           Post New Job
//         </Link>
//       </div>

//       {/* Status Filter Tabs */}
//       <div className="flex space-x-2 overflow-x-auto pb-2">
//         <Link
//           href="/homeowner/jobs"
//           className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${!status
//             ? 'bg-[#1149C7] text-white shadow-lg shadow-blue-500/20'
//             : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//             }`}
//         >
//           All Jobs ({summary.totalJobs})
//         </Link>
//         <Link
//           href="/homeowner/jobs?status=OPEN"
//           className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${status === 'OPEN'
//             ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
//             : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//             }`}
//         >
//           Open ({summary.activeJobs || getStatusCount('OPEN')})
//         </Link>
//         <Link
//           href="/homeowner/jobs?status=HIRED"
//           className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${status === 'HIRED'
//             ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
//             : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//             }`}
//         >
//           Hired ({summary.hiredJobs || getStatusCount('HIRED')})
//         </Link>
//         <Link
//           href="/homeowner/jobs?status=COMPLETED"
//           className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${status === 'COMPLETED'
//             ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
//             : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//             }`}
//         >
//           Completed ({summary.completedJobs || getStatusCount('COMPLETED')})
//         </Link>
//         <Link
//           href="/homeowner/jobs?status=CANCELLED"
//           className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${status === 'CANCELLED'
//             ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
//             : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
//             }`}
//         >
//           Cancelled ({summary.cancelledJobs || getStatusCount('CANCELLED')})
//         </Link>
//       </div>

//       {/* Jobs List */}
//       <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
//         {jobs.length > 0 ? (
//           <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
//             {jobs.map((job) => (
//               <div
//                 key={job._id}
//                 className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
//               >
//                 <div className="flex flex-col lg:flex-row justify-between gap-4">
//                   <div className="flex-1">
//                     <div className="flex items-start gap-3 mb-2">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <p className="text-xs font-bold text-[#1149C7] uppercase tracking-widest">
//                             {job.category?.name}
//                           </p>
//                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${job.status === 'OPEN'
//                               ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
//                               : job.status === 'HIRED'
//                                 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
//                                 : job.status === 'COMPLETED'
//                                   ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
//                                   : job.status === 'CANCELLED'
//                                     ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
//                                     : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
//                             }`}>
//                             {formatStatus(job.status)}
//                           </span>
//                         </div>
//                         <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
//                           {job.subCategory?.name}
//                         </h3>
//                         <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
//                           {job.description || 'No description provided'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
//                       <div className="flex items-center gap-1.5">
//                         <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
//                         {job.location?.city} • {job.location?.postcode}
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
//                         Posted: {formatDate(job.createdAt)}
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//                         ₹{job.budgetMin || '0'} - ₹{job.budgetMax || 'Negotiable'}
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
//                         {job.leadCount || 0} Quotes
//                       </div>
//                     </div>

//                     {/* Show hired tradesperson info if status is HIRED */}
//                     {job.status === 'HIRED' && job.hiredTradesperson && (
//                       <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
//                         <div className="flex items-center gap-2">
//                           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
//                             <span className="text-xs font-bold text-white">
//                               {job.hiredTradesperson.companyName?.[0] || 'H'}
//                             </span>
//                           </div>
//                           <div>
//                             <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
//                               Hired Professional
//                             </p>
//                             <p className="text-sm font-bold text-zinc-900 dark:text-white">
//                               {job.hiredTradesperson.companyName || 'Professional'}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex flex-col sm:flex-row gap-3 lg:items-start">
//                     <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl min-w-[100px]">
//                       <span className="text-2xl font-black text-[#1149C7]">{job.leadCount || 0}</span>
//                       <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Leads</span>
//                     </div>

//                     <div className="flex flex-col gap-2">
//                       <Link
//                         href={`/homeowner/jobs/${job._id}`}
//                         className="px-4 py-2 text-sm font-bold text-white bg-zinc-900 dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-all text-center shadow-lg shadow-black/5"
//                       >
//                         View Details
//                       </Link>

//                       {job.leadCount > 0 && job.status === 'OPEN' && (
//                         <Link
//                           href={`/homeowner/jobs/${job._id}#leads`}
//                           className="px-4 py-2 text-sm font-bold text-[#1149C7] bg-white dark:bg-zinc-900 border-2 border-[#1149C7] rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-center"
//                         >
//                           View Quotes
//                         </Link>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Leads Preview - only show for OPEN jobs */}
//                 {job.status === 'OPEN' && job.leads && job.leads.length > 0 && (
//                   <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
//                     <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">Recent Quotes:</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {job.leads.slice(0, 3).map((lead, index) => (
//                         <div key={index} className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
//                           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1149C7] to-[#155DFC] flex items-center justify-center">
//                             <span className="text-xs font-bold text-white">
//                               {lead.tradesperson?.companyName?.charAt(0) || lead.tradesperson?.user?.name?.charAt(0) || 'T'}
//                             </span>
//                           </div>
//                           <div>
//                             <p className="text-sm font-bold text-zinc-900 dark:text-white">
//                               {lead.tradesperson?.companyName || lead.tradesperson?.user?.name || 'Tradesperson'}
//                             </p>
//                             {lead.priceEstimate && (
//                               <p className="text-xs font-bold text-zinc-500">₹{lead.priceEstimate}</p>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                       {job.leads.length > 3 && (
//                         <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
//                           <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">+{job.leads.length - 3} more</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16 px-4">
//             <div className="mx-auto h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
//               <svg className="h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
//               {status ? `No ${formatStatus(status)} jobs found` : 'No jobs posted yet'}
//             </h3>
//             <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
//               {status
//                 ? `You don't have any ${formatStatus(status).toLowerCase()} jobs.`
//                 : 'Post your first job to start receiving quotes from local trusted tradespeople.'}
//             </p>
//             <Link
//               href="/jobs"
//               className="inline-flex items-center px-6 py-3 bg-[#1149C7] text-white font-bold rounded-xl hover:bg-[#155DFC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition-all"
//             >
//               <PlusIcon className="h-5 w-5 mr-2" />
//               Post New Job
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { 
//   PlusIcon, 
//   ChatBubbleLeftRightIcon,
//   PencilIcon,
//   TrashIcon,
//   EyeIcon,
//   StarIcon
// } from "@heroicons/react/24/outline";
// import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
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
//                 className={`${
//                   !status
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 All Jobs ({summary.totalJobs})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=OPEN"
//                 className={`${
//                   status === 'OPEN'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Open ({summary.activeJobs || getStatusCount('OPEN')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=HIRED"
//                 className={`${
//                   status === 'HIRED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Hired ({summary.hiredJobs || getStatusCount('HIRED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=COMPLETED"
//                 className={`${
//                   status === 'COMPLETED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Completed ({summary.completedJobs || getStatusCount('COMPLETED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=CANCELLED"
//                 className={`${
//                   status === 'CANCELLED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
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
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         {/* Job Header */}
//                         <div className="flex items-center gap-3 mb-3">
//                           <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm font-semibold rounded-full">
//                             {job.category?.name || 'Category'}
//                           </span>
//                           <span className={`px-4 py-1 text-sm font-semibold rounded-full ${
//                             job.status === 'OPEN' 
//                               ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
//                               : job.status === 'HIRED'
//                               ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
//                               : job.status === 'COMPLETED'
//                               ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
//                               : job.status === 'CANCELLED'
//                               ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
//                               : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20'
//                           }`}>
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
//                       <div className="flex flex-col gap-2 ml-4">
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

//                     {/* RATING SECTION - FOR COMPLETED JOBS */}
//                     {job.status === 'COMPLETED' && (
//                       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
//                         {job.hasRated ? (
//                           // Already Rated - Show Rating
//                           <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
//                             <div className="flex items-center gap-3">
//                               <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
//                                 <span className="text-white text-xl">✓</span>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-bold text-green-700 dark:text-green-400">
//                                   You rated this job
//                                 </p>
//                                 <div className="flex items-center gap-1 mt-1">
//                                   {[...Array(5)].map((_, i) => (
//                                     <StarIconSolid
//                                       key={i}
//                                       className={`h-4 w-4 ${
//                                         i < (job.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
//                                       }`}
//                                     />
//                                   ))}
//                                   <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
//                                     {job.rating || 0}/5
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <Link
//                               href={`/homeowner/jobs/${job._id}`}
//                               className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
//                             >
//                               View Details →
//                             </Link>
//                           </div>
//                         ) : (
//                           // Not Rated - Show Rate Button
//                           <Link
//                             href={`/homeowner/jobs/${job._id}/rate`}
//                             className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
//                           >
//                             <StarIcon className="h-5 w-5 mr-2" />
//                             Rate This Job
//                           </Link>
//                         )}
//                       </div>
//                     )}

//                     {/* View Quotes Button - For OPEN jobs */}
//                     {job.leadCount > 0 && job.status === 'OPEN' && (
//                       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
//                         <Link
//                           href={`/homeowner/jobs/${job._id}#quotes`}
//                           className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                         >
//                           <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
//                           View {job.leadCount} Quote{job.leadCount !== 1 ? 's' : ''}
//                         </Link>
//                       </div>
//                     )}
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
//                   href="/homeowner/post-job"
//                   className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                 >
//                   <PlusIcon className="h-5 w-5 mr-2" />
//                   Post New Job
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModalOpen && jobToDelete && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
//             <div className="text-center">
//               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
//                 <TrashIcon className="h-8 w-8 text-red-600" />
//               </div>
              
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                 Delete This Job?
//               </h3>
              
//               <div className="mb-6">
//                 <p className="text-gray-600 dark:text-zinc-400 mb-2">
//                   Are you sure you want to delete
//                 </p>
//                 <p className="font-bold text-gray-900 dark:text-white text-lg">
//                   "{jobToDelete.subCategory?.name || 'this job'}"?
//                 </p>
//               </div>

//               <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
//                 <p className="text-sm text-yellow-800 dark:text-yellow-200">
//                   ⚠️ This action cannot be undone
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={closeDeleteModal}
//                   disabled={deleting}
//                   className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteJob}
//                   disabled={deleting}
//                   className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {deleting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Deleting...
//                     </>
//                   ) : (
//                     <>
//                       <TrashIcon className="h-5 w-5" />
//                       Delete Job
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }














// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { 
//   PlusIcon, 
//   ChatBubbleLeftRightIcon,
//   PencilIcon,
//   TrashIcon,
//   EyeIcon,
//   StarIcon
// } from "@heroicons/react/24/outline";
// import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
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
//         console.log("Fetched jobs:", data.data?.jobs); // Debug log
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
//                 className={`${
//                   !status
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 All Jobs ({summary.totalJobs})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=OPEN"
//                 className={`${
//                   status === 'OPEN'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Open ({summary.activeJobs || getStatusCount('OPEN')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=HIRED"
//                 className={`${
//                   status === 'HIRED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Hired ({summary.hiredJobs || getStatusCount('HIRED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=COMPLETED"
//                 className={`${
//                   status === 'COMPLETED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
//               >
//                 Completed ({summary.completedJobs || getStatusCount('COMPLETED')})
//               </Link>
//               <Link
//                 href="/homeowner/jobs?status=CANCELLED"
//                 className={`${
//                   status === 'CANCELLED'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-300'
//                 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
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
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         {/* Job Header */}
//                         <div className="flex items-center gap-3 mb-3">
//                           <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm font-semibold rounded-full">
//                             {job.category?.name || 'Category'}
//                           </span>
//                           <span className={`px-4 py-1 text-sm font-semibold rounded-full ${
//                             job.status === 'OPEN' 
//                               ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
//                               : job.status === 'HIRED'
//                               ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
//                               : job.status === 'COMPLETED'
//                               ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
//                               : job.status === 'CANCELLED'
//                               ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
//                               : 'bg-gray-50 text-gray-600 dark:bg-gray-900/20'
//                           }`}>
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
//                           {job.leadCount !== undefined && job.leadCount > 0 && (
//                             <span className="flex items-center font-semibold text-blue-600">
//                               💬 {job.leadCount} Quote{job.leadCount !== 1 ? 's' : ''}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex flex-col gap-2 ml-4">
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

//                     {/* RATING SECTION - FOR COMPLETED JOBS */}
//                     {job.status === 'COMPLETED' && (
//                       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
//                         {job.hasRated ? (
//                           // Already Rated - Show Rating
//                           <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
//                             <div className="flex items-center gap-3">
//                               <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
//                                 <span className="text-white text-xl">✓</span>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-bold text-green-700 dark:text-green-400">
//                                   You rated this job
//                                 </p>
//                                 <div className="flex items-center gap-1 mt-1">
//                                   {[...Array(5)].map((_, i) => (
//                                     <StarIconSolid
//                                       key={i}
//                                       className={`h-4 w-4 ${
//                                         i < (job.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
//                                       }`}
//                                     />
//                                   ))}
//                                   <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
//                                     {job.rating || 0}/5
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <Link
//                               href={`/homeowner/jobs/${job._id}`}
//                               className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
//                             >
//                               View Details →
//                             </Link>
//                           </div>
//                         ) : (
//                           // Not Rated - Show Rate Button
//                           <Link
//                             href={`/homeowner/jobs/${job._id}/rate`}
//                             className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
//                           >
//                             <StarIcon className="h-5 w-5 mr-2" />
//                             Rate This Job
//                           </Link>
//                         )}
//                       </div>
//                     )}

//                     {/* View Quotes Button - For OPEN jobs */}
//                     {job.leadCount > 0 && job.status === 'OPEN' && (
//                       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
//                         <Link
//                           href={`/homeowner/jobs/${job._id}#quotes`}
//                           className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#155DFC] to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
//                         >
//                           <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
//                           View {job.leadCount} Quote{job.leadCount !== 1 ? 's' : ''}
//                         </Link>
//                       </div>
//                     )}
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
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModalOpen && jobToDelete && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
//             <div className="text-center">
//               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
//                 <TrashIcon className="h-8 w-8 text-red-600" />
//               </div>
              
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                 Delete This Job?
//               </h3>
              
//               <div className="mb-6">
//                 <p className="text-gray-600 dark:text-zinc-400 mb-2">
//                   Are you sure you want to delete
//                 </p>
//                 <p className="font-bold text-gray-900 dark:text-white text-lg">
//                   "{jobToDelete.subCategory?.name || 'this job'}"?
//                 </p>
//               </div>

//               <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
//                 <p className="text-sm text-yellow-800 dark:text-yellow-200">
//                   ⚠️ This action cannot be undone
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={closeDeleteModal}
//                   disabled={deleting}
//                   className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteJob}
//                   disabled={deleting}
//                   className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {deleting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Deleting...
//                     </>
//                   ) : (
//                     <>
//                       <TrashIcon className="h-5 w-5" />
//                       Delete Job
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


































