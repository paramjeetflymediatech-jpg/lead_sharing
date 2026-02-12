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
import { jobAPI } from "../../services/api";

export default function TradespersonBrowseTab({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        try {
            setLoading(true);
            const data = await jobAPI.getAll();

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
                <Text style={styles.headerTitle}>Browse Jobs</Text>
                <Text style={styles.headerSubtitle}>{jobs.length} available jobs</Text>
            </View>

            {/* Jobs List */}
            <FlatList
                data={jobs}
                keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => <JobCard job={item} navigation={navigation} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No jobs available</Text>
                        <Text style={styles.emptyText}>Check back later for new opportunities</Text>
                    </View>
                }
            />
        </View>
    );
}

function JobCard({ job, navigation }) {
    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate("JobDetails", { jobId: job.id })}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle} numberOfLines={2}>
                    {job.description || "Job Description"}
                </Text>
                <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
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
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetIcon}>💰</Text>
                    <Text style={styles.budgetText}>
                        Budget: £{job.budget_min || 0} - £{job.budget_max}
                    </Text>
                </View>
            )}

            <View style={styles.jobFooter}>
                <View style={styles.creditBadge}>
                    <Text style={styles.creditText}>1 Credit</Text>
                </View>
                <Text style={styles.unlockText}>Unlock to Quote →</Text>
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
    listContent: {
        padding: 16,
        paddingTop: 8,
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
    newBadge: {
        backgroundColor: "#10B981",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    newText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
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
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    budgetIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    budgetText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#10B981",
    },
    jobFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    creditBadge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    creditText: {
        color: "#F59E0B",
        fontSize: 13,
        fontWeight: "700",
    },
    unlockText: {
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "600",
    },
});
