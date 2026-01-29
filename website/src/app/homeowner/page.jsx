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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name || 'Homeowner'}!</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">Track your projects and manage quotes from professionals.</p>
        </div>
        <Link
          href="/homeowner/jobs/new"
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
                  <Link href="/homeowner/jobs/new" className="mt-4 inline-block text-[#1149C7] font-bold text-sm">Post one now →</Link>
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
                <span className="text-zinc-500 tracking-widest uppercase">Success Rate</span>
                <span className="text-purple-500">85%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#1149C7] opacity-20 rounded-full blur-3xl group-hover:blur-2xl transition-all" />
            <h3 className="text-lg font-bold mb-2">Need a Pro?</h3>
            <p className="text-sm text-zinc-400 mb-6 font-medium leading-relaxed">The fastest way to get your project done accurately.</p>
            <Link
              href="/homeowner/jobs/new"
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