import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import Link from "next/link";

async function getHomeownerJobs(userId) {
  try {
    console.log("Fetching homeowner jobs for user:", userId);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/homeowner/my-jobs`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-user-role': 'HOMEOWNER'
      },
    });
    
    if (!res.ok) {
      console.log('Homeowner Jobs API Error:', res.status, res.statusText);
      return { 
        success: false,
        data: {
          jobs: [],
          summary: {
            totalJobs: 0,
            activeJobs: 0,
            completedJobs: 0,
            cancelledJobs: 0,
            totalLeads: 0
          }
        }
      };
    }
    
    const data = await res.json();
    console.log("Homeowner jobs data received:", data);
    return data;
  } catch (error) {
    console.log('Fetch Error:', error);
    return { 
      success: false,
      data: {
        jobs: [],
        summary: {
          totalJobs: 0,
          activeJobs: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          totalLeads: 0
        }
      }
    };
  }
}

export default async function HomeownerDashboard() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "HOMEOWNER") {
    console.log("User not authenticated or not homeowner, redirecting to login");
    redirect("/auth/login");
  }

  console.log("User authenticated:", user.id, user.email);

  const data = await getHomeownerJobs(user.id);
  const jobs = data.data?.jobs || [];
  const summary = data.data?.summary || {
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalLeads: 0
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Format date
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

  // Format time ago
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

  // Get recent jobs (first 5)
  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Homeowner Dashboard</h1>
                  <p className="text-xs text-gray-500">Manage your projects</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500 font-medium">Welcome back</p>
                <p className="text-sm font-semibold text-gray-900">{user.name || user.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || 'Homeowner'}!</h1>
              <p className="text-gray-600 mt-2">Track your projects and manage quotes from professionals.</p>
            </div>
            <Link 
              href="/homeowner/jobs/new"
              className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Jobs Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Jobs Posted</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">{summary.totalJobs}</p>
                  <span className="ml-2 text-sm text-gray-500">projects</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Active: <span className="font-semibold text-green-600">{summary.activeJobs}</span></p>
            </div>
          </div>

          {/* Active Jobs Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
                  <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">{summary.activeJobs}</p>
                  <span className="ml-2 text-sm text-gray-500">open now</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">All jobs are currently open</p>
            </div>
          </div>

          {/* Quotes Received Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                  <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Quotes Received</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">{summary.totalLeads}</p>
                  <span className="ml-2 text-sm text-gray-500">total quotes</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">From {jobs.filter(j => j.leadCount > 0).length} jobs</p>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-blue-100">Account Status</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-white">Verified</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500/30">
              <p className="text-xs text-blue-100">Premium homeowner account</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Jobs Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Posted Jobs</h2>
                    <p className="text-sm text-gray-500 mt-1">Recent projects with quotes and updates</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      {summary.totalJobs} total
                    </span>
                    <Link 
                      href="/homeowner/jobs"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      View all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Job List */}
              <div className="p-6">
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div 
                        key={job._id}
                        className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {job.category?.name?.charAt(0) || 'J'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                    {job.category?.name || 'Job'} • {job.subCategory?.name || 'Category'}
                                  </h3>
                                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                    job.status === 'OPEN' ? 'bg-green-100 text-green-800 border border-green-200' :
                                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                    job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                  }`}>
                                    {formatStatus(job.status)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {job.description || 'No description provided'}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{job.location?.city || 'Location'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{job.location?.postcode || 'N/A'}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>₹{job.budgetMin} - ₹{job.budgetMax}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formatTimeAgo(job.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Leads Section */}
                            {job.leadCount > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-blue-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                      <span className="text-sm font-medium">{job.leadCount} Quote{job.leadCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    {job.latestLead?.priceEstimate && (
                                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                                        ₹{job.latestLead.priceEstimate}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Latest: {formatTimeAgo(job.latestLead?.receivedAt)}
                                  </span>
                                </div>
                                
                                {job.latestLead && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start gap-3">
                                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 text-xs font-medium">
                                          {job.latestLead.tradespersonName?.charAt(0) || 'T'}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {job.latestLead.tradespersonName || 'Professional'}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {job.latestLead.message || 'Interested in your job'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Link 
                              href={`/homeowner/jobs/${job._id}`}
                              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-colors group"
                            >
                              View Details
                              <svg className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            
                            {job.leadCount > 0 && (
                              <Link 
                                href={`/homeowner/jobs/${job._id}#leads`}
                                className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors"
                              >
                                View Quotes
                              </Link>
                            )}
                            
                            {job.media && job.media.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{job.media.length} attachment{job.media.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mb-4">
                      <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start your first home project and get competitive quotes from verified professionals.
                    </p>
                    <Link
                      href="/homeowner/jobs/new"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Your First Job
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your projects</p>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <Link 
                    href="/homeowner/jobs/new"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Post New Job</p>
                        <p className="text-sm text-gray-500">Get quotes from professionals</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  <Link 
                    href="/homeowner/jobs?status=OPEN"
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Active Jobs</p>
                        <p className="text-sm text-gray-500">{summary.activeJobs} open projects</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  <Link 
                    href={`/homeowner/messages`}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Messages</p>
                        <p className="text-sm text-gray-500">{summary.totalLeads} quotes received</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Job Statistics Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-bold text-gray-900">Job Statistics</h3>
                <p className="text-sm text-gray-500 mt-1">Overview of your projects</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Open Jobs</span>
                      <span className="text-sm font-bold text-green-600">{summary.activeJobs}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(summary.activeJobs / Math.max(summary.totalJobs, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">With Quotes</span>
                      <span className="text-sm font-bold text-blue-600">{jobs.filter(j => j.leadCount > 0).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${(jobs.filter(j => j.leadCount > 0).length / Math.max(summary.totalJobs, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Avg. Quotes/Job</span>
                      <span className="text-sm font-bold text-purple-600">
                        {summary.totalJobs > 0 ? (summary.totalLeads / summary.totalJobs).toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min((summary.totalLeads / Math.max(summary.totalJobs, 1)) * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{summary.totalJobs}</p>
                      <p className="text-xs text-gray-500">Total Jobs</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{summary.totalLeads}</p>
                      <p className="text-xs text-blue-500">Total Quotes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
              <p className="text-blue-100 mb-5">
                Our support team is available 24/7 to help you find the right professional.
              </p>
              <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg">
                Contact Support
              </button>
            </div>

            {/* Recent Activity */}
            {jobs.filter(j => j.leadCount > 0).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500 mt-1">Latest quotes and updates</p>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {jobs
                      .filter(j => j.latestLead)
                      .slice(0, 3)
                      .map((job) => (
                        <div key={job._id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {job.latestLead?.tradespersonName || 'Professional'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {job.category?.name}: {job.latestLead?.message?.substring(0, 40)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(job.latestLead?.receivedAt)}
                            </p>
                          </div>
                          {job.latestLead?.priceEstimate && (
                            <div className="text-sm font-bold text-green-600">
                              ₹{job.latestLead.priceEstimate}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-sm text-gray-500">
              © 2024 TradeConnect. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}