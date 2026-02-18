"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, hired: 0, pending: 0, rejected: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // First, check if user is logged in
      const userRes = await fetch("/api/me", {
        credentials: "include",
      });

      if (!userRes.ok) {
        router.push("/auth/login");
        return;
      }

      const userData = await userRes.json();

      console.log("UserData", userData)

      // Check if user is a tradesperson (your API returns tradespersonProfile)
      if (!userData?.tradespersonProfile) {
        router.push("/auth/login");
        return;
      }

      const tp = userData.tradespersonProfile;
      setProfile({
        companyName: tp.company_name || "My Company",
        credits: tp.credits || 0,
      });

      // Fetch leads
      const leadsRes = await fetch("/api/leads/my", {
        credentials: "include",
      });

      if (!leadsRes.ok) {
        throw new Error("Failed to load leads");
      }

      const leadsData = await leadsRes.json();
      setLeads(leadsData.data?.leads || []);
      setStats(leadsData.data?.stats || { total: 0, hired: 0, pending: 0, rejected: 0 });

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (min, max) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `$${min} - $${max}`;
    if (max) return `Up to $${max}`;
    if (min) return `From $${min}`;
    return "Budget not specified";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      {/* <header className="sticky top-0 z-[1] border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <Link href="/tradesperson" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-15 rounded-lg bg-[#155DFC] flex items-center justify-center text-white font-bold">
              Leads
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-black hidden xs:block">
              My Leads
            </h1>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-full bg-[#155DFC]/10 px-3 py-1.5 border border-[#155DFC]/20">
              <span className="text-xs font-bold text-[#155DFC]">
                Credits: {profile?.credits || 0}
              </span>
            </div>
            <Link
              href="/tradesperson"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-zinc-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header> */}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-black mb-2">
            Your Unlocked Leads
          </h2>
          <p className="text-zinc-600">
            You have {stats.total} unlocked lead{stats.total !== 1 ? "s" : ""}
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-300 p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              📁
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              No unlocked leads yet
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              Start unlocking job leads to see homeowner contact details
            </p>
            <Link
              href="/tradesperson"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-bold text-white hover:bg-[#155DFC]/90"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                {/* Lead Status Badge */}
                <div className="flex justify-end mb-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${lead.status === 'HIRED'
                    ? 'bg-green-100 text-green-800'
                    : lead.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                    {lead.status}
                  </span>
                </div>

                {/* Lead Header */}
                <div className="mb-6 pb-6 border-b border-zinc-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
                      {lead.job.categoryName || "Category"}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs font-medium text-zinc-600">
                      {lead.job.subCategoryName || "Sub Category"}
                    </span>
                    <span className="ml-auto text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                      Unlocked
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    {lead.job.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Unlocked on {formatDate(lead.unlockedAt || lead.createdAt)}
                  </p>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      📍 {lead.job.location || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                      Budget
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      💰 {formatBudget(lead.job.budgetMin, lead.job.budgetMax)}
                    </p>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                      Job Status
                    </p>
                    <p className={`text-sm font-semibold ${lead.job.isHired
                      ? 'text-green-600'
                      : lead.job.status === 'OPEN'
                        ? 'text-blue-600'
                        : 'text-zinc-600'
                      }`}>
                      {lead.job.status}
                      {lead.job.isHired && " ✓"}
                    </p>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                      Your Estimate
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {lead.priceEstimate ? `$${lead.priceEstimate}` : "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-700 mb-3">
                    Job Description:
                  </p>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-4 rounded-xl">
                    {lead.job.description || "No description provided"}
                  </p>
                </div>

                {/* Your Message */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-700 mb-3">
                    Your Message to Homeowner:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <p className="text-sm text-zinc-700 italic">
                      "{lead.message || "No message provided"}"
                    </p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900 text-lg">
                        Homeowner Contact Details
                      </h4>
                      <p className="text-sm text-green-700">
                        Contact the homeowner directly to discuss the job
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 uppercase mb-2">
                        Name
                      </p>
                      <p className="text-base font-semibold text-green-900">
                        {lead.job.contactName || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-white/50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 uppercase mb-2">
                        Email
                      </p>
                      <a
                        href={`mailto:${lead.job.contactEmail}`}
                        className="text-base font-semibold text-green-900 hover:underline break-all"
                      >
                        {lead.job.contactEmail || "Not provided"}
                      </a>
                    </div>

                    <div className="bg-white/50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-green-700 uppercase mb-2">
                        Phone
                      </p>
                      <a
                        href={`tel:${lead.job.contactPhone}`}
                        className="text-base font-semibold text-green-900 hover:underline"
                      >
                        {lead.job.contactPhone || "Not provided"}
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`tel:${lead.job.contactPhone}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
                    >
                      📞 Call Homeowner
                    </a>

                    <a
                      href={`mailto:${lead.job.contactEmail}?subject=Job Inquiry&body=Hi, I'm interested in your job.`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-green-600 px-6 py-3 text-sm font-bold text-green-600 hover:bg-green-50"
                    >
                      ✉️ Send Email
                    </a>

                    <Link
                      href="/tradesperson"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-200"
                    >
                      🔍 Find More Jobs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}