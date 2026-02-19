import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native";
import { homeownerAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function HomeownerJobsTab({ navigation, route }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("ALL");

    useFocusEffect(
        useCallback(() => {
            if (route.params?.initialFilter) {
                setFilter(route.params.initialFilter);
                navigation.setParams({ initialFilter: undefined });
            }
            loadJobs();
        }, [route.params?.initialFilter])
    );

    async function loadJobs() {
        try {
            if (jobs.length === 0) setLoading(true);

            const data = await homeownerAPI.getMyJobs();

            let jobsList = [];
            if (Array.isArray(data)) {
                jobsList = data;
            } else if (Array.isArray(data?.data)) {
                jobsList = data.data;
            } else if (Array.isArray(data?.data?.jobs)) {
                jobsList = data.data.jobs;
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
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterButton, filter === f.key && styles.activeFilterButton]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text style={[styles.filterText, filter === f.key && styles.activeFilterText]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Jobs List */}
            <FlatList
                data={filteredJobs}
                keyExtractor={(item, index) => (item?._id ? item._id.toString() : item?.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => <JobCard job={item} navigation={navigation} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No jobs found</Text>
                        <Text style={styles.emptySubtext}>
                            {filter === "ALL" ? "Post your first job to get started" : `No ${filter.toLowerCase()} jobs yet`}
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

function JobCard({ job, navigation }) {
    const getStatusInfo = (status) => {
        switch (status) {
            case "OPEN": return { color: "#10B981", bg: "#D1FAE5" };
            case "HIRED": return { color: "#2563EB", bg: "#DBEAFE" };
            case "COMPLETED": return { color: "#8B5CF6", bg: "#EDE9FE" };
            case "CANCELLED": return { color: "#EF4444", bg: "#FEE2E2" };
            default: return { color: "#6B7280", bg: "#F3F4F6" };
        }
    };

    const status = getStatusInfo(job.status);

    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation?.navigate("JobDetails", { jobId: job._id || job.id })}
            activeOpacity={0.8}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.description || "Job Description"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                        {job.status?.charAt(0) + job.status?.slice(1).toLowerCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.jobDetails}>
                <View style={styles.detailItem}>
                    <Feather name="map-pin" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.detailText}>
                        {job.city && job.postcode
                            ? `${job.city}, ${job.postcode}`
                            : job.postcode || job.city || "Location not specified"}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Feather name="clock" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.detailText}>
                        {job.start_time
                            ? job.start_time
                                .toLowerCase()
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")
                            : "Flexible"}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.dateText}>
                    Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'recently'}
                </Text>
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
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
        paddingBottom: hp(2),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: normalize(24),
        fontWeight: "800",
        color: "#111827",
    },
    filterContainer: {
        maxHeight: hp(8),
        marginBottom: hp(1),
    },
    filterContent: {
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        gap: wp(2),
    },
    filterButton: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(5),
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginRight: wp(2),
    },
    activeFilterButton: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    filterText: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: "#6B7280",
    },
    activeFilterText: {
        color: "#FFFFFF",
    },
    listContent: {
        padding: wp(5),
        paddingBottom: hp(12),
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
    jobTitle: {
        flex: 1,
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#111827",
        marginRight: wp(3),
    },
    statusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(1.5),
        backgroundColor: "#F3F4F6",
    },
    statusText: {
        fontSize: normalize(11),
        fontWeight: "700",
    },
    jobDetails: {
        flexDirection: "row",
        gap: wp(5),
        marginBottom: hp(2),
    },
    jobDetail: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        fontSize: normalize(14),
        color: "#4B5563",
        fontWeight: "500",
    },
    budgetRow: {
        flexDirection: "row",
        marginBottom: hp(2),
    },
    budgetBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
    },
    budgetText: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: "#374151",
    },
    cardFooter: {
        paddingTop: hp(2),
        borderTopWidth: 1,
        borderTopColor: "#F9FAFB",
    },
    jobDate: {
        fontSize: normalize(12),
        color: "#9CA3AF",
        fontStyle: "italic",
    },
});
