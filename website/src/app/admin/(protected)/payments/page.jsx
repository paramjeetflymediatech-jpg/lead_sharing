"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  User,
  Calendar,
  DollarSign,
  Award,
  Search,
  Filter,
  Download
} from "lucide-react";
import Pagination from "../../../../components/Pagination";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  // const [filteredPayments, setFilteredPayments] = useState([]); // Server side now
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCredits: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, statusFilter, dateRange]);

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

      // 2️⃣ Check if user is an admin
      const userRole = userData?.user?.role || userData?.role;
      if (userRole?.toUpperCase() !== "ADMIN") {
        router.push("/auth/login");
        return;
      }

      setUserData({
        id: userData.user?.id || userData.id,
        email: userData.user?.email || userData.email,
        name: userData.user?.name || userData.name || userData.user?.email || userData.email,
        role: userRole,
      });

      // 3️⃣ Fetch payments with pagination & filters
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const paymentsRes = await fetch(`/api/admin/payments?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!paymentsRes.ok) throw new Error("Failed to load payments");

      const paymentsData = await paymentsRes.json();

      setPayments(paymentsData.payments || []);
      setTotalItems(paymentsData.total || 0);

      // 4️⃣ Stats come from summary object now
      if (paymentsData.summary) {
        setStats({
          totalRevenue: parseFloat(paymentsData.summary.total_revenue || 0).toFixed(2),
          totalCredits: paymentsData.summary.total_credits_issued || 0,
          totalTransactions: paymentsData.summary.total_transactions || 0,
          completedTransactions: paymentsData.summary.completed || 0,
          pendingTransactions: paymentsData.summary.pending || 0
        });
      }

    } catch (err) {
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
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

  const exportToCSV = () => {
    // Note: Exporting only current page or all? usually all.
    // implementing basic export for current view for now or fetch all.
    // For simplicity keeping current view or might need separate endpoint for full export.
    const headers = [
      "ID", "Tradesperson ID", "User ID", "Plan", "Amount", "Currency",
      "Credits", "Status", "Stripe Session ID", "Payment Intent ID", "Transaction Date"
    ];

    const csvData = payments.map(payment => [
      payment.id, payment.tradesperson_id, payment.user_id, payment.plan,
      payment.amount, payment.currency, payment.credits, payment.status,
      payment.stripe_session_id, payment.stripe_payment_intent_id, formatDate(payment.created_at)
    ]);

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#155DFC] to-blue-500 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-black">
                All Payments
              </h2>
              <p className="text-zinc-600">
                View and manage all tradesperson payment transactions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500"> Revenue</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.totalRevenue}
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
                <p className="text-sm font-medium text-zinc-500">Credits</p>
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
                <p className="text-sm font-medium text-zinc-500">Transactions</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Completed</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.completedTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Pending</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Filters</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateRange({ start: "", end: "" });
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by ID, plan, status..."
                  className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-sm text-zinc-600">
              Showing <span className="font-bold">{payments.length}</span> results of{" "}
              <span className="font-bold">{totalItems}</span> total
            </p>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-300 p-12 text-center bg-white">
            <div className="mx-auto w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              No payments found
            </h3>
            <p className="text-sm text-zinc-600">
              {totalItems === 0
                ? "No payment transactions have been made yet"
                : "No payments match your filters"}
            </p>
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

                      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          User ID: {payment.user_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          Tradesperson ID: {payment.tradesperson_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.created_at)}
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
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 mb-1">Credits</p>
                      <p className="font-bold text-green-600">{payment.credits}</p>
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
                      <p className="text-zinc-500 mb-1">Stripe Session</p>
                      <p className="font-bold text-zinc-900 truncate" title={payment.stripe_session_id}>
                        {payment.stripe_session_id?.substring(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Payment Intent</p>
                      <p className="font-bold text-zinc-900 truncate" title={payment.stripe_payment_intent_id}>
                        {payment.stripe_payment_intent_id?.substring(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Transaction Date</p>
                      <p className="font-bold text-zinc-900">
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div >
              </div>
            ))
            }
          </div >
        )}

        {/* Pagination Section */}
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

      </main>
    </div>
  );
}