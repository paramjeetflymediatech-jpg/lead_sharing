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
import { tradespersonAPI, jobAPI, userAPI } from "../services/api";
import LogoutModal from "../components/LogoutModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";

export default function TradespersonDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard() {
    try {
      setLoading(true);

      // Load profile, available jobs, and my leads in parallel
      const [meData, jobsData, leadsData] = await Promise.all([
        userAPI.getMe().catch(() => null),
        jobAPI.getAll().catch(() => ({})),
        tradespersonAPI.getMyLeads().catch(() => ({})),
      ]);

      // Handle Profile Data from userAPI.getMe()
      if (meData?.success && meData?.tradespersonProfile) {
        setProfile(meData.tradespersonProfile);
      } else {
        console.log("Failed to load profile or not found", meData);
        setProfile(null);
      }

      // Handle different API response formats for jobs
      let jobs = [];
      if (Array.isArray(jobsData)) {
        jobs = jobsData;
      } else if (jobsData?.data && Array.isArray(jobsData.data)) {
        jobs = jobsData.data;
      } else if (jobsData?.jobs && Array.isArray(jobsData.jobs)) {
        jobs = jobsData.jobs;
      }

      // Handle different API response formats for leads
      let leads = [];
      if (Array.isArray(leadsData)) {
        leads = leadsData;
      } else if (leadsData?.data && Array.isArray(leadsData.data)) {
        leads = leadsData.data;
      } else if (leadsData?.leads && Array.isArray(leadsData.leads)) {
        leads = leadsData.leads;
      }

      setAvailableJobs(jobs.slice(0, 5));
      setMyLeads(leads);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Set empty data on error
      setAvailableJobs([]);
      setMyLeads([]);
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

  // Calculate stats
  const credits = profile?.credits || 0;
  const activeLeads = myLeads.filter((l) => !l.is_unlocked).length || 0;
  const unlockedLeads = myLeads.filter((l) => l.is_unlocked).length || 0;
  const totalJobs = availableJobs.length || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#1149C7"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {profile?.company_name || user?.name || "Tradesperson"}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Credits Banner */}
      <View style={styles.creditsBanner}>
        <View style={styles.creditsIconContainer}>
          <Text style={styles.creditsIcon}>💳</Text>
        </View>
        <View style={styles.creditsContent}>
          <Text style={styles.creditsLabel}>Available Credits</Text>
          <Text style={styles.creditsValue}>{credits}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyCreditsButton}
          onPress={() =>
            Alert.alert("Buy Credits", "Credit purchase coming soon!")
          }
        >
          <Text style={styles.buyCreditsText}>Buy More</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Active Leads"
            value={activeLeads}
            icon="📋"
            color="#F59E0B"
          />
          <StatCard
            title="Unlocked"
            value={unlockedLeads}
            icon="🔓"
            color="#10B981"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Available Jobs"
            value={totalJobs}
            icon="🏗️"
            color="#1149C7"
          />
          <StatCard
            title="Profile Views"
            value={profile?.profile_views || 0}
            icon="👁️"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <ActionButton
            title="Browse Jobs"
            icon="🔍"
            color="#1149C7"
            onPress={() =>
              navigation?.navigate?.("BrowseJobs") ||
              Alert.alert("Coming Soon", "Browse jobs screen not yet implemented")
            }
          />
          <ActionButton
            title="My Leads"
            icon="📝"
            color="#10B981"
            onPress={() =>
              navigation?.navigate?.("MyLeads") ||
              Alert.alert("Coming Soon", "My leads screen not yet implemented")
            }
          />
          <ActionButton
            title="Messages"
            icon="💬"
            color="#F59E0B"
            onPress={() =>
              navigation?.navigate?.("Messages") ||
              Alert.alert("Coming Soon", "Messages screen not yet implemented")
            }
          />
          <ActionButton
            title="Profile"
            icon="👤"
            color="#8B5CF6"
            onPress={() =>
              navigation?.navigate?.("Profile") ||
              Alert.alert("Coming Soon", "Profile screen not yet implemented")
            }
          />
        </View>
      </View>

      {/* Available Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          {availableJobs.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation?.navigate?.("BrowseJobs")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {availableJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No jobs available</Text>
            <Text style={styles.emptyStateText}>
              Check back later for new opportunities
            </Text>
          </View>
        ) : (
          availableJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              credits={credits}
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
function JobCard({ job, credits, onPress }) {
  const canAfford = credits >= 1; // Assuming 1 credit per lead

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {job.description || "Job Description"}
        </Text>
        {!canAfford && (
          <View style={styles.lowCreditsTag}>
            <Text style={styles.lowCreditsText}>Low Credits</Text>
          </View>
        )}
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.jobDetail}>
          <Text style={styles.jobDetailIcon}>📍</Text>
          <Text style={styles.jobDetailText}>
            {job.city && job.postcode
              ? `${job.city}, ${job.postcode}`
              : job.postcode || job.city || "Location not specified"}
          </Text>
        </View>

        <View style={styles.jobDetail}>
          <Text style={styles.jobDetailIcon}>⏰</Text>
          <Text style={styles.jobDetailText}>
            {job.start_time
              ? job.start_time
                .toLowerCase()
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
              : "Flexible"}
          </Text>
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

      <View style={styles.jobFooter}>
        <Text style={styles.jobCreditCost}>1 Credit to quote</Text>
        <Text style={styles.viewJobText}>View Details →</Text>
      </View>
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
    marginBottom: 20,
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
  creditsBanner: {
    backgroundColor: "#1149C7",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1149C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  creditsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  creditsIcon: {
    fontSize: 28,
  },
  creditsContent: {
    flex: 1,
  },
  creditsLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  buyCreditsButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyCreditsText: {
    color: "#1149C7",
    fontSize: 14,
    fontWeight: "700",
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
  lowCreditsTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowCreditsText: {
    color: "#DC2626",
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
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  jobCreditCost: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
  viewJobText: {
    fontSize: 14,
    color: "#1149C7",
    fontWeight: "600",
  },
});
