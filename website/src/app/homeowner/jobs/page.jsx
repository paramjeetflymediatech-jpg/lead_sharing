import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import Link from "next/link";

async function getJobs(status = null) {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/homeowner/jobs`;
    if (status) {
      url += `?status=${status}`;
    }
    
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.log('Jobs API Error:', res.status);
      return { success: false, jobs: [], total: 0 };
    }
    
    return await res.json();
  } catch (error) {
    console.log('Fetch Error:', error);
    return { success: false, jobs: [], total: 0 };
  }
}

export default async function HomeownerJobsPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOMEOWNER") {
    redirect("/auth/login");
  }

  const status = searchParams?.status || null;
  const data = await getJobs(status);
  const jobs = data.jobs || [];

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/homeowner" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  H
                </div>
                <h1 className="text-xl font-bold text-gray-900">My Jobs</h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500 font-medium">Homeowner</p>
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Posted Jobs</h1>
              <p className="text-gray-600 mt-2">Manage all your home project jobs and quotes</p>
            </div>
            <Link 
              href="/homeowner/jobs/new"
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Post New Job
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex space-x-2 mt-6 overflow-x-auto">
            <Link
              href="/homeowner/jobs"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${!status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Jobs ({jobs.length})
            </Link>
            <Link
              href="/homeowner/jobs?status=OPEN"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${status === 'OPEN' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Open ({jobs.filter(j => j.status === 'OPEN').length})
            </Link>
            <Link
              href="/homeowner/jobs?status=IN_PROGRESS"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              In Progress ({jobs.filter(j => j.status === 'IN_PROGRESS').length})
            </Link>
            <Link
              href="/homeowner/jobs?status=COMPLETED"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${status === 'COMPLETED' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Completed ({jobs.filter(j => j.status === 'COMPLETED').length})
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {jobs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.category?.name || 'Job'} - {job.subCategory?.name || 'Category'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                              job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {formatStatus(job.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {job.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{job.location?.city || 'Location'} • {job.location?.postcode || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Posted: {formatDate(job.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Budget: ₹{job.budgetMin || '0'} - ₹{job.budgetMax || 'Negotiable'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-2xl font-bold text-blue-700">{job.leadCount || 0}</span>
                        <span className="text-xs text-blue-600">Leads</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link 
                          href={`/homeowner/jobs/${job._id}`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        
                        {job.leadCount > 0 && (
                          <Link 
                            href={`/homeowner/jobs/${job._id}#leads`}
                            className="px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-lg hover:bg-green-50 transition-colors text-center"
                          >
                            View Leads
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Leads Preview (if any) */}
                  {job.leads && job.leads.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Quotes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.leads.slice(0, 3).map((lead, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {lead.tradesperson?.user?.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {lead.tradesperson?.user?.name || 'Tradesperson'}
                              </p>
                              {lead.priceEstimate && (
                                <p className="text-xs text-gray-500">₹{lead.priceEstimate}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {job.leads.length > 3 && (
                          <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                            <span className="text-sm text-gray-600">+{job.leads.length - 3} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {status ? `No ${status.toLowerCase().replace('_', ' ')} jobs found` : 'No jobs posted yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {status 
                  ? `You don't have any ${status.toLowerCase().replace('_', ' ')} jobs.`
                  : 'Post your first job to start receiving quotes from local trusted tradespeople.'}
              </p>
              <Link
                href="/homeowner/jobs/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Post New Job
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}