import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { homeownerAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function HomeownerHomeTab({ navigation }) {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    async function loadData() {
        try {
            // Only set loading on initial load
            if (!dashboard) setLoading(true);

            const [dashboardData, jobsData] = await Promise.all([
                homeownerAPI.getDashboard().catch(() => null),
                homeownerAPI.getMyJobs().catch(() => ({})),
            ]);

            setDashboard(dashboardData);

            let jobs = [];
            if (Array.isArray(jobsData)) {
                jobs = jobsData;
            } else if (Array.isArray(jobsData?.data)) {
                jobs = jobsData.data;
            } else if (Array.isArray(jobsData?.data?.jobs)) {
                jobs = jobsData.data.jobs;
            } else if (Array.isArray(jobsData?.jobs)) {
                jobs = jobsData.jobs;
            }

            setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, 3) : []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const activeJobs = dashboard?.activeJobs || recentJobs.filter((j) => j.status === "OPEN").length || 0;
    const totalJobs = dashboard?.totalJobs || recentJobs.length || 0;
    const pendingQuotes = dashboard?.pendingQuotes || 0;
    const completedJobs = dashboard?.completedJobs || 0;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name?.split(" ")[0] || "Homeowner"}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
                    <Text style={styles.profileInitials}>
                        {user?.name?.charAt(0).toUpperCase() || "H"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon="activity"
                    value={activeJobs}
                    label="Active Jobs"
                    color="#2563EB"
                    bgColor="#EFF6FF"
                    onPress={() => navigation.navigate("Jobs", { screen: "JobsMain", params: { initialFilter: "OPEN" } })}
                />
                <StatCard
                    icon="clock"
                    value={pendingQuotes}
                    label="Pending"
                    color="#F59E0B"
                    bgColor="#FFFBEB"
                    onPress={() => navigation.navigate("Jobs", { screen: "JobsMain", params: { initialFilter: "OPEN" } })}
                />
                <StatCard
                    icon="briefcase"
                    value={totalJobs}
                    label="Total Jobs"
                    color="#10B981"
                    bgColor="#ECFDF5"
                    onPress={() => navigation.navigate("Jobs", { screen: "JobsMain", params: { initialFilter: "ALL" } })}
                />
                <StatCard
                    icon="check-circle"
                    value={completedJobs}
                    label="Completed"
                    color="#8B5CF6"
                    bgColor="#F5F3FF"
                    onPress={() => navigation.navigate("Jobs", { screen: "JobsMain", params: { initialFilter: "COMPLETED" } })}
                />
            </View>

            {/* Quick Action - Post Job */}
            <TouchableOpacity
                style={styles.postJobButton}
                onPress={() => navigation.navigate("PostJob")}
                activeOpacity={0.9}
            >
                <View style={styles.postJobContent}>
                    <View style={styles.postJobIconContainer}>
                        <Feather name="plus" size={24} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={styles.postJobTitle}>Post a New Job</Text>
                        <Text style={styles.postJobSubtitle}>Get quotes from local pros</Text>
                    </View>
                </View>
                <Feather name="chevron-right" size={24} color="#FFFFFF" style={{ opacity: 0.8 }} />
            </TouchableOpacity>

            {/* Recent Jobs */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Jobs</Text>
                    {recentJobs.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Jobs")}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {recentJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Feather name="inbox" size={32} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyTitle}>No jobs yet</Text>
                        <Text style={styles.emptyText}>Post your first job to get started</Text>
                    </View>
                ) : (
                    recentJobs.map((job, index) => <JobCard key={job._id || job.id || index} job={job} navigation={navigation} />)
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function StatCard({ icon, value, label, color, bgColor, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: bgColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color }]}>
                <Feather name={icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function JobCard({ job, navigation }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return { color: "#10B981", bg: "#D1FAE5" };
            case "HIRED": return { color: "#2563EB", bg: "#DBEAFE" };
            case "COMPLETED": return { color: "#8B5CF6", bg: "#EDE9FE" };
            case "CANCELLED": return { color: "#EF4444", bg: "#FEE2E2" };
            default: return { color: "#6B7280", bg: "#F3F4F6" };
        }
    };

    const statusStyle = getStatusColor(job.status);

    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation?.navigate("JobDetails", { jobId: job._id || job.id })}
            activeOpacity={0.7}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.description || "Job Description"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {job.status?.charAt(0) + job.status?.slice(1).toLowerCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.jobDetailsRow}>
                <View style={styles.jobDetailItem}>
                    <Feather name="map-pin" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.jobDetailText}>{job.postcode || "N/A"}</Text>
                </View>
                <View style={styles.jobDetailItem}>
                    <Feather name="clock" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.jobDetailText}>
                        {job.start_time ? job.start_time.replace(/_/g, " ").toLowerCase() : "flexible"}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                    Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'recently'}
                </Text>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingTop: hp(7),
        paddingBottom: hp(2.5),
    },
    greeting: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    welcomeText: {
        fontSize: normalize(14),
        color: "#6B7280",
        marginBottom: hp(0.5),
    },
    userName: {
        fontSize: normalize(24),
        fontWeight: "800",
        color: "#111827",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: wp(4), // Reduced padding for small screens
        justifyContent: "space-between",
        gap: wp(3), // Use gap for better spacing management
    },
    statCard: {
        width: wp(44), // Slightly less than half to account for gap/padding
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(1.5), // Reduced margin
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(3),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: hp(1.5),
    },
    statValue: {
        fontSize: normalize(20), // Responsive font size
        fontWeight: "700",
        marginBottom: hp(0.5),
    },
    statLabel: {
        fontSize: normalize(13),
        color: "#6B7280",
    },
    postJobButton: {
        marginHorizontal: wp(5),
        marginBottom: hp(3),
        backgroundColor: "#2563EB",
        borderRadius: wp(4),
        padding: wp(5),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    postJobContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    postJobIconContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(3),
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(4),
    },
    postJobTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: hp(0.5),
    },
    postJobSubtitle: {
        fontSize: normalize(13),
        color: "rgba(255, 255, 255, 0.9)",
    },
    section: {
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(2),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#111827",
    },
    viewAllText: {
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "600",
    },
    jobCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    jobHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: hp(1.5),
    },
    categoryContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    categoryIcon: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(2),
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(2.5),
    },
    categoryName: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: "#1F2937",
    },
    statusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(1.5),
        backgroundColor: "#F3F4F6",
    },
    statusText: {
        fontSize: normalize(11),
        fontWeight: "600",
        color: "#6B7280",
    },
    jobDescription: {
        fontSize: normalize(14),
        color: "#4B5563",
        marginBottom: hp(2),
        lineHeight: normalize(20),
    },
    jobFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: normalize(13),
        color: "#6B7280",
        marginLeft: wp(1.5),
    },
    postedTime: {
        fontSize: normalize(12),
        color: "#9CA3AF",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: wp(8),
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        borderWidth: 2,
        borderColor: "#F3F4F6",
        borderStyle: "dashed",
    },
    emptyIconContainer: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: hp(2),
    },
    emptyTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: hp(1),
    },
    emptyText: {
        fontSize: normalize(14),
        color: "#6B7280",
        textAlign: "center",
    },
});
