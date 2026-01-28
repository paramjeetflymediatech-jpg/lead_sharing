"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomeownerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">TradeConnect</h1>
              <p className="text-xs text-gray-500">Homeowner</p>
            </div>
          </Link>
        </div>

        {/* User Info - FIXED: Now shows user name properly */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "jobs"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Jobs
            {summary.totalJobs > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {summary.totalJobs}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "quotes"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Quotes
            {summary.totalLeads > 0 && (
              <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {summary.totalLeads}
              </span>
            )}
          </button>

          <Link
            href="/jobs"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md hover:shadow-lg mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </Link>
        </nav>

        {/* Help Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Help & Support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header - FIXED: Shows user name */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "dashboard" && `Welcome back, ${user?.name || user?.email?.split('@')[0] || 'User'}!`}
                  {activeTab === "jobs" && "My Jobs"}
                  {activeTab === "quotes" && "Quotes Received"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === "dashboard" && "Here's your project overview"}
                  {activeTab === "jobs" && `You have ${summary.totalJobs} posted jobs`}
                  {activeTab === "quotes" && `${summary.totalLeads} quotes from professionals`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalJobs}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {summary.activeJobs} active
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary.activeJobs}</p>
                  <p className="text-xs text-gray-500 mt-2">Currently open</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Total Quotes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalLeads}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    From {jobs.filter(j => j.leadCount > 0).length} jobs
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-blue-100 font-medium">Account Status</p>
                  <p className="text-3xl font-bold mt-2">Verified</p>
                  <p className="text-xs text-blue-100 mt-2">Premium account</p>
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Jobs</h2>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {recentJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recentJobs.map((job) => (
                        <div 
                          key={job._id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                          onClick={() => router.push(`/homeowner/jobs/${job._id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {job.category?.name} • {job.subCategory?.name}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                  job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                  job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {formatStatus(job.status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {job.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {job.location?.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  ₹{job.budgetMin} - ₹{job.budgetMax}
                                </span>
                                {/* FIXED: Quote icon is now non-clickable (just display) */}
                                {job.leadCount > 0 && (
                                  <span className="flex items-center gap-1 text-blue-600 font-medium pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    {job.leadCount} quote{job.leadCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTimeAgo(job.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
                      <p className="text-gray-500 mb-4">Post your first job to get started</p>
                      <Link
                        href="/homeowner/jobs/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Post New Job
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Jobs View */}
          {activeTab === "jobs" && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job._id}
                        className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                        onClick={() => router.push(`/homeowner/jobs/${job._id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {job.category?.name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {job.category?.name} • {job.subCategory?.name}
                                  </h3>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    job.status === 'OPEN' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                    'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                    {formatStatus(job.status)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Posted {formatTimeAgo(job.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {job.location?.city}, {job.location?.postcode}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ₹{job.budgetMin} - ₹{job.budgetMax}
                              </span>
                              {/* FIXED: Quote icon is now non-clickable (just display) */}
                              {job.leadCount > 0 && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium pointer-events-none">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  {job.leadCount} quote{job.leadCount !== 1 ? 's' : ''}
                                </span>
                              )}
                              {job.media && job.media.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {job.media.length} file{job.media.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            {job.latestLead && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 text-xs font-medium">
                                      {job.latestLead.tradespersonName?.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-gray-600">
                                    Latest quote from <span className="font-medium text-gray-900">{job.latestLead.tradespersonName}</span>
                                  </span>
                                  {job.latestLead.priceEstimate && (
                                    <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                      ₹{job.latestLead.priceEstimate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-500 mb-4">Start your first project and get quotes from professionals</p>
                    <Link
                      href="/homeowner/jobs/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Post New Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quotes View */}
          {activeTab === "quotes" && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                {jobs.filter(j => j.leadCount > 0).length > 0 ? (
                  <div className="space-y-6">
                    {jobs.filter(j => j.leadCount > 0).map((job) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-5">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {job.category?.name} • {job.subCategory?.name}
                          </h3>
                          <p className="text-sm text-gray-500">{job.description}</p>
                        </div>
                        <div className="space-y-3">
                          {job.leads?.map((lead) => (
                            <div key={lead._id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {lead.tradesperson?.user?.name?.charAt(0) || 'T'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-gray-900">
                                      {lead.tradesperson?.user?.name || 'Professional'}
                                    </p>
                                    {lead.priceEstimate && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                                        ₹{lead.priceEstimate}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{lead.message}</p>
                                  <p className="text-xs text-gray-400">
                                    {formatTimeAgo(lead.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
                    <p className="text-gray-500">Post a job to start receiving quotes from professionals</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}