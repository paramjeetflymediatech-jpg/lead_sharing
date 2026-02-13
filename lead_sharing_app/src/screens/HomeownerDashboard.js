import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { homeownerAPI, jobAPI } from "../services/api";
import LogoutModal from "../components/LogoutModal";

export default function HomeownerDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // Load dashboard data and recent jobs in parallel
      const [dashboardData, jobsData] = await Promise.all([
        homeownerAPI.getDashboard().catch(() => null),
        homeownerAPI.getMyJobs().catch(() => ({})),
      ]);

      setDashboard(dashboardData);

      // Handle different API response formats
      let jobs = [];
      if (Array.isArray(jobsData)) {
        jobs = jobsData;
      } else if (jobsData?.data && Array.isArray(jobsData.data)) {
        jobs = jobsData.data;
      } else if (jobsData?.jobs && Array.isArray(jobsData.jobs)) {
        jobs = jobsData.jobs;
      }

      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Set empty data on error
      setRecentJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  function handleLogout() {
    setLogoutModalVisible(true);
  }

  async function confirmLogout() {
    setLogoutModalVisible(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1149C7" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // Calculate stats (with fallbacks)
  const activeJobs = dashboard?.activeJobs || recentJobs.filter(j => j.status === 'OPEN').length || 0;
  const totalJobs = dashboard?.totalJobs || recentJobs.length || 0;
  const pendingQuotes = dashboard?.pendingQuotes || 0;
  const completedJobs = dashboard?.completedJobs || recentJobs.filter(j => j.status === 'COMPLETED').length || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1149C7"]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Homeowner"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            icon="🏗️"
            color="#1149C7"
          />
          <StatCard
            title="Pending Quotes"
            value={pendingQuotes}
            icon="📋"
            color="#F59E0B"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Jobs"
            value={totalJobs}
            icon="📊"
            color="#10B981"
          />
          <StatCard
            title="Completed"
            value={completedJobs}
            icon="✅"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <ActionButton
            title="Post New Job"
            icon="➕"
            color="#1149C7"
            onPress={() => navigation?.navigate?.("PostJob") ||
              Alert.alert("Coming Soon", "Post job screen not yet implemented")}
          />
          <ActionButton
            title="My Jobs"
            icon="📝"
            color="#10B981"
            onPress={() => navigation?.navigate?.("MyJobs") ||
              Alert.alert("Coming Soon", "My jobs screen not yet implemented")}
          />
          <ActionButton
            title="Messages"
            icon="💬"
            color="#F59E0B"
            onPress={() => navigation?.navigate?.("Messages") ||
              Alert.alert("Coming Soon", "Messages screen not yet implemented")}
          />
          <ActionButton
            title="Profile"
            icon="👤"
            color="#8B5CF6"
            onPress={() => navigation?.navigate?.("Profile") ||
              Alert.alert("Coming Soon", "Profile screen not yet implemented")}
          />
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          {recentJobs.length > 0 && (
            <TouchableOpacity onPress={() => navigation?.navigate?.("MyJobs")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No jobs yet</Text>
            <Text style={styles.emptyStateText}>
              Post your first job to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation?.navigate?.("PostJob") ||
                Alert.alert("Coming Soon", "Post job feature coming soon")}
            >
              <Text style={styles.emptyStateButtonText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() =>
                navigation?.navigate?.("JobDetail", { jobId: job.id }) ||
                Alert.alert("Job Details", `${job.description}`)
              }
            />
          ))
        )}
      </View>
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onLogout={confirmLogout}
      />
    </ScrollView>
  );
}

// ============================================
// Stat Card Component
// ============================================
function StatCard({ title, value, icon, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

// ============================================
// Action Button Component
// ============================================
function ActionButton({ title, icon, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

// ============================================
// Job Card Component
// ============================================
function JobCard({ job, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "#10B981";
      case "HIRED":
        return "#1149C7";
      case "COMPLETED":
        return "#8B5CF6";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status) => {
    return status?.charAt(0) + status?.slice(1).toLowerCase() || "Open";
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {job.description || "Job Description"}
        </Text>
        <View
          style={[
            styles.jobStatus,
            { backgroundColor: getStatusColor(job.status) },
          ]}
        >
          <Text style={styles.jobStatusText}>
            {getStatusLabel(job.status)}
          </Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.jobDetail}>
          <Text style={styles.jobDetailIcon}>📍</Text>
          <Text style={styles.jobDetailText}>{job.postcode || "N/A"}</Text>
        </View>

        <View style={styles.jobDetail}>
          <Text style={styles.jobDetailIcon}>⏰</Text>
          <Text style={styles.jobDetailText}>{job.start_time?.replace(/_/g, " ") || "Flexible"}</Text>
        </View>

        {job.budget_max && (
          <View style={styles.jobDetail}>
            <Text style={styles.jobDetailIcon}>💰</Text>
            <Text style={styles.jobDetailText}>
              ${job.budget_min || 0} - ${job.budget_max}
            </Text>
          </View>
        )}
      </View>

      {job.created_at && (
        <Text style={styles.jobDate}>
          Posted {new Date(job.created_at).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  viewAllText: {
    fontSize: 14,
    color: "#1149C7",
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#1149C7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 12,
  },
  jobStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  jobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  jobDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  jobDetailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  jobDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  jobDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
