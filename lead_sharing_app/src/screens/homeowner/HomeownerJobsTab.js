import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { homeownerAPI } from "../../services/api";

export default function HomeownerJobsTab({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        try {
            setLoading(true);
            const data = await homeownerAPI.getMyJobs();

            let jobsList = [];
            if (Array.isArray(data)) {
                jobsList = data;
            } else if (Array.isArray(data?.data)) {
                jobsList = data.data;
            } else if (Array.isArray(data?.jobs)) {
                jobsList = data.jobs;
            }

            setJobs(Array.isArray(jobsList) ? jobsList : []);
        } catch (error) {
            console.error("Error loading jobs:", error);
        } finally {
            setLoading(false);
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadJobs();
        setRefreshing(false);
    }

    const filteredJobs = Array.isArray(jobs) ? jobs.filter((job) =>
        filter === "ALL" ? true : job.status === filter
    ) : [];

    const filters = [
        { key: "ALL", label: "All" },
        { key: "OPEN", label: "Open" },
        { key: "HIRED", label: "Hired" },
        { key: "COMPLETED", label: "Completed" },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Jobs</Text>
                <Text style={styles.headerSubtitle}>{jobs.length} total jobs</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filtersContainer}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Jobs List */}
            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <JobCard job={item} navigation={navigation} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                        <Text style={styles.emptyText}>
                            {filter === "ALL" ? "Post your first job to get started" : `No ${filter.toLowerCase()} jobs yet`}
                        </Text>
                    </View>
                }
            />
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

            <View style={styles.jobDetails}>
                <View style={styles.jobDetail}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{job.postcode || "N/A"}</Text>
                </View>
                <View style={styles.jobDetail}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <Text style={styles.detailText}>{job.start_time?.replace(/_/g, " ") || "Flexible"}</Text>
                </View>
            </View>

            {job.budget_max && (
                <View style={styles.budgetContainer}>
                    <Text style={styles.budgetLabel}>Budget:</Text>
                    <Text style={styles.budgetValue}>
                        £{job.budget_min || 0} - £{job.budget_max}
                    </Text>
                </View>
            )}

            {job.created_at && (
                <Text style={styles.jobDate}>
                    Posted {new Date(job.created_at).toLocaleDateString()}
                </Text>
            )}
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
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    filtersContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterTabActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 48,
        alignItems: "center",
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
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
        marginBottom: 12,
    },
    jobTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    jobDetails: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    jobDetail: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    detailText: {
        fontSize: 14,
        color: "#6B7280",
    },
    budgetContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: 14,
        color: "#6B7280",
        marginRight: 6,
    },
    budgetValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#10B981",
    },
    jobDate: {
        fontSize: 12,
        color: "#9CA3AF",
    },
});
