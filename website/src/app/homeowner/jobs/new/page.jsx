import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";
import Link from "next/link";
import { cookies } from "next/headers";

async function getJob(id) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    const res = await fetch(`http://localhost:3000/api/homeowner/jobs/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${token}`
      },
    });
    
    if (!res.ok) {
      console.error('API error:', res.status);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export default async function JobDetailsPage({ params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOMEOWNER") {
    redirect("/auth/login");
  }

  const { id } = await params;
  const jobData = await getJob(id);

  if (!jobData || !jobData.success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Job Not Found</h2>
          <Link 
            href="/homeowner/jobs"
            className="mt-4 inline-block text-[#155DFC] hover:underline"
          >
            ← Back to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  const { job, leads, leadCount } = jobData;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/homeowner/jobs" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="h-8 w-8 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold shadow-lg shadow-[#155DFC]/20">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Job Details
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/homeowner"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link 
          href="/homeowner/jobs"
          className="inline-flex items-center text-sm text-[#155DFC] hover:underline mb-6"
        >
          ← Back to My Jobs
        </Link>

        {/* Job Info Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {job.category?.name || 'Job'} - {job.subCategory?.name || 'Service'}
              </h2>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                job.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                job.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {job.status?.replace('_', ' ') || 'OPEN'}
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-zinc-500">Job ID</p>
              <p className="font-mono text-sm">{job._id?.substring(0, 8)}...</p>
            </div>
          </div>

          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{job.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-zinc-500">Location</p>
              <p className="font-medium">{job.location?.city || 'N/A'}</p>
              <p className="text-sm text-zinc-500">{job.location?.postcode}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Start Time</p>
              <p className="font-medium">{job.startTime?.replace('_', ' ') || 'Flexible'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Job Stage</p>
              <p className="font-medium">{job.jobStage || 'Planning'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Budget</p>
              <p className="font-medium">
                {job.budgetMin > 0 ? `₹${job.budgetMin} - ₹${job.budgetMax}` : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm font-medium text-zinc-500 mb-2">Your Contact Info</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Name</p>
                <p className="font-medium">{job.contactName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="font-medium">{job.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="font-medium">{job.contactEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-black dark:text-white">
              Professionals Interested ({leadCount || 0})
            </h3>
            <span className="text-sm text-zinc-500">
              Max 3 leads per job
            </span>
          </div>

          {leads && leads.length > 0 ? (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div 
                  key={lead.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-black dark:text-white">
                        {lead.tradesperson?.companyName || 'Professional'}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {lead.tradesperson?.user?.name || 'Tradesperson'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {lead.tradesperson?.skills?.slice(0, 3).map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Contacted</p>
                      <p className="text-sm font-medium">
                        {new Date(lead.unlockedAt).toLocaleDateString()}
                      </p>
                      <button className="mt-2 rounded-lg bg-[#155DFC] px-4 py-2 text-xs font-medium text-white hover:bg-[#1149c7] transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl mb-4 mx-auto">👷</div>
              <p className="text-zinc-600 dark:text-zinc-400">
                No professionals have unlocked this lead yet.
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Your job is live and visible to tradespeople.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}