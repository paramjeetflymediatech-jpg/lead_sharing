import React, { useState, useEffect } from "react";
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

export default function HomeownerHomeTab({ navigation }) {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
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
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || "Homeowner"}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard icon="🏗️" value={activeJobs} label="Active Jobs" color="#2563EB" />
                <StatCard icon="📋" value={pendingQuotes} label="Pending" color="#F59E0B" />
                <StatCard icon="📊" value={totalJobs} label="Total Jobs" color="#10B981" />
                <StatCard icon="✅" value={completedJobs} label="Completed" color="#8B5CF6" />
            </View>

            {/* Quick Action - Post Job */}
            <TouchableOpacity
                style={styles.postJobButton}
                onPress={() => navigation.navigate("PostJob")}
            >
                <Text style={styles.postJobIcon}>➕</Text>
                <Text style={styles.postJobText}>Post New Job</Text>
            </TouchableOpacity>

            {/* Recent Jobs */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Jobs</Text>
                    {recentJobs.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Jobs")}>
                            <Text style={styles.viewAllText}>View All →</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {recentJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No jobs yet</Text>
                        <Text style={styles.emptyText}>Post your first job to get started</Text>
                    </View>
                ) : (
                    recentJobs.map((job, index) => <JobCard key={job.id || index} job={job} navigation={navigation} />)
                )}
            </View>
        </ScrollView>
    );
}

function StatCard({ icon, value, label, color }) {
    return (
        <View style={[styles.statCard, { borderTopColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function JobCard({ job, navigation }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "#10B981";
            case "HIRED": return "#2563EB";
            case "COMPLETED": return "#8B5CF6";
            case "CANCELLED": return "#EF4444";
            default: return "#6B7280";
        }
    };

    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation?.navigate("JobDetails", { jobId: job.id })}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle} numberOfLines={2}>
                    {job.description || "Job Description"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <Text style={styles.statusText}>
                        {job.status?.charAt(0) + job.status?.slice(1).toLowerCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.jobInfo}>
                <Text style={styles.jobInfoText}>📍 {job.postcode || "N/A"}</Text>
                <Text style={styles.jobInfoText}>⏰ {job.start_time?.replace(/_/g, " ") || "Flexible"}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    greeting: {
        fontSize: 15,
        color: "#6B7280",
    },
    userName: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderTopWidth: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
    },
    postJobButton: {
        backgroundColor: "#2563EB",
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    postJobIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    postJobText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#1F2937",
    },
    viewAllText: {
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "600",
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    jobCard: {
        backgroundColor: "#FFFFFF",
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
        marginBottom: 10,
    },
    jobTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
    },
    jobInfo: {
        flexDirection: "row",
        gap: 16,
    },
    jobInfoText: {
        fontSize: 13,
        color: "#6B7280",
    },
});
