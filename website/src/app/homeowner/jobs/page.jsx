"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function HomeownerJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  
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

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const userRes = await fetch("/api/profile", {
        credentials: "include"
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
      }

      // Fetch jobs
      let url = "/api/homeowner/my-jobs";
      if (status) {
        url += `?status=${status}`;
      }

      const jobsRes = await fetch(url, {
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
      console.error("Error fetching data:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Posted Jobs</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">Manage all your home project jobs and quotes</p>
        </div>
        <Link
          href="/homeowner/jobs/new"
          className="inline-flex items-center px-5 py-3 bg-[#1149C7] text-white text-sm font-bold rounded-xl hover:bg-[#155DFC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Link
          href="/homeowner/jobs"
          className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            !status 
              ? 'bg-[#1149C7] text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          All Jobs ({summary.totalJobs})
        </Link>
        <Link
          href="/homeowner/jobs?status=OPEN"
          className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            status === 'OPEN'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' 
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          Open ({summary.activeJobs})
        </Link>
        <Link
          href="/homeowner/jobs?status=IN_PROGRESS"
          className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            status === 'IN_PROGRESS'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          In Progress ({jobs.filter(j => j.status === 'IN_PROGRESS').length})
        </Link>
        <Link
          href="/homeowner/jobs?status=COMPLETED"
          className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            status === 'COMPLETED'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          Completed ({summary.completedJobs})
        </Link>
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {jobs.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-[#1149C7] uppercase tracking-widest">
                            {job.category?.name}
                          </p>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            job.status === 'OPEN' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                            job.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                            job.status === 'COMPLETED' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                          }`}>
                            {formatStatus(job.status)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                          {job.subCategory?.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {job.description || 'No description provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                        {job.location?.city} • {job.location?.postcode}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Posted: {formatDate(job.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        ₹{job.budgetMin || '0'} - ₹{job.budgetMax || 'Negotiable'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                        {job.leadCount || 0} Quotes
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:items-start">
                    <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl min-w-[100px]">
                      <span className="text-2xl font-black text-[#1149C7]">{job.leadCount || 0}</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Leads</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Link 
                        href={`/homeowner/jobs/${job._id}`}
                        className="px-4 py-2 text-sm font-bold text-white bg-zinc-900 dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-all text-center shadow-lg shadow-black/5"
                      >
                        View Details
                      </Link>
                      
                      {job.leadCount > 0 && (
                        <Link 
                          href={`/homeowner/jobs/${job._id}#leads`}
                          className="px-4 py-2 text-sm font-bold text-[#1149C7] bg-white dark:bg-zinc-900 border-2 border-[#1149C7] rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-center"
                        >
                          View Quotes
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Leads Preview */}
                {job.leads && job.leads.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-widest">Recent Quotes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.leads.slice(0, 3).map((lead, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1149C7] to-[#155DFC] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {lead.tradesperson?.user?.name?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                              {lead.tradesperson?.user?.name || 'Tradesperson'}
                            </p>
                            {lead.priceEstimate && (
                              <p className="text-xs font-bold text-zinc-500">₹{lead.priceEstimate}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {job.leads.length > 3 && (
                        <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">+{job.leads.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {status ? `No ${formatStatus(status)} jobs found` : 'No jobs posted yet'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              {status 
                ? `You don't have any ${formatStatus(status).toLowerCase()} jobs.`
                : 'Post your first job to start receiving quotes from local trusted tradespeople.'}
            </p>
            <Link
              href="/homeowner/jobs/new"
              className="inline-flex items-center px-6 py-3 bg-[#1149C7] text-white font-bold rounded-xl hover:bg-[#155DFC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition-all"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Post New Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}