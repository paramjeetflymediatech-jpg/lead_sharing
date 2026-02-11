"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, ArrowLeft, CheckCircle, Clock, XCircle, Download, Calendar, DollarSign, Award } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalCredits: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Check if user is logged in
      const userRes = await fetch("/api/me", {
        credentials: "include",
      });

      if (!userRes.ok) {
        router.push("/auth/login");
        return;
      }

      const userData = await userRes.json();

      // 2️⃣ Check if user is a tradesperson
      if (!userData?.tradespersonProfile) {
        router.push("/auth/login");
        return;
      }

      const tp = userData.tradespersonProfile;
      setProfile({
        companyName: tp.company_name || "My Company",
        credits: tp.credits || 0,
      });

      // 3️⃣ Fetch payment history
      const paymentsRes = await fetch("/api/tradesperson/payments", {
        credentials: "include",
      });

      if (!paymentsRes.ok) {
        throw new Error("Failed to load payments");
      }

      const paymentsData = await paymentsRes.json();
      const paymentsList = paymentsData.payments || [];
      setPayments(paymentsList);

      // 4️⃣ Calculate stats
      const totalSpent = paymentsList.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalCredits = paymentsList
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.credits || 0), 0);

      setStats({
        totalSpent: totalSpent.toFixed(2),
        totalCredits,
        totalTransactions: paymentsList.length
      });

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanBadgeColor = (plan) => {
    const colors = {
      starter: "bg-blue-100 text-blue-800 border-blue-200",
      pro: "bg-purple-100 text-purple-800 border-purple-200",
      business: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[plan?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    if (status === "completed") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "pending") return <Clock className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <Link href="/tradesperson" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-lg bg-[#155DFC] flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-black hidden xs:block">
              Payment History
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
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-zinc-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#155DFC] to-blue-500 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-black">
                Payment History
              </h2>
              <p className="text-zinc-600">
                View all your credit purchase transactions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Spent</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {payments[0]?.currency || 'GBP'} {stats.totalSpent}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Credits Purchased</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalCredits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Transactions</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#155DFC] to-blue-500 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Need More Credits?</h3>
              <p className="text-blue-100">Purchase credits to unlock more job leads</p>
            </div>
            <Link
              href="/tradesperson/credits"
              className="px-6 py-3 bg-white text-[#155DFC] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap"
            >
              Buy Credits
            </Link>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-300 p-12 text-center bg-white">
            <div className="mx-auto w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              No payment history yet
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              Your credit purchase transactions will appear here
            </p>
            <Link
              href="/tradesperson/credits"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-bold text-white hover:bg-[#155DFC]/90"
            >
              <CreditCard className="w-4 h-4" />
              Buy Your First Credits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Side - Payment Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(payment.status)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${getPlanBadgeColor(payment.plan)}`}>
                          {payment.plan?.toUpperCase() || 'N/A'}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${getStatusColor(payment.status)}`}>
                          {payment.status?.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900 mb-1">
                        {payment.credits} Credits Purchase
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          Payment ID: #{payment.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Amount */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-500">Amount Paid</p>
                      <p className="text-2xl font-bold text-zinc-900">
                        {payment.currency} {parseFloat(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {payment.currency} {(parseFloat(payment.amount) / payment.credits).toFixed(2)} per credit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 mb-1">Credits Received</p>
                      <p className="font-bold text-green-600">{payment.credits} Credits</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Plan Type</p>
                      <p className="font-bold text-zinc-900">{payment.plan}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Payment Status</p>
                      <p className={`font-bold ${payment.status === 'completed' ? 'text-green-600' :
                        payment.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {payment.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Transaction Date</p>
                      <p className="font-bold text-zinc-900">
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-zinc-50 rounded-2xl p-8 border border-zinc-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              Need Help with Payments?
            </h3>
            <p className="text-zinc-600 mb-6">
              Contact our support team for any payment-related queries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@tradeconnect.com"
                className="px-6 py-3 bg-white border-2 border-zinc-300 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50"
              >
                Email Support
              </a>
              <Link
                href="/tradesperson/credits"
                className="px-6 py-3 bg-[#155DFC] text-white rounded-xl font-bold hover:bg-[#155DFC]/90"
              >
                Buy More Credits
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}