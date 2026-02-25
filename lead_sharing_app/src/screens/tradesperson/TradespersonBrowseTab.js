import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from "react-native";
import { jobAPI } from "../../services/api";
import { normalize, wp, hp } from "../../utils/responsive";
import { Feather } from "@expo/vector-icons";

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Browse Jobs</Text>
                    <Text style={styles.headerSubtitle}>{jobs.length} available jobs</Text>
                </View>
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
            onPress={() => navigation.navigate("JobDetails", { jobId: job._id })}
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
                    <Text style={styles.detailText}>
                        {job.city && job.postcode
                            ? `${job.city}, ${job.postcode}`
                            : job.postcode || job.city || "Location not specified"}
                    </Text>
                </View>
                <View style={styles.jobDetail}>
                    <Text style={styles.detailIcon}>⏰</Text>
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

            {job.budget_max && (
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetIcon}>💰</Text>
                    <Text style={styles.budgetText}>
                        Budget: ${job.budget_min || 0} - ${job.budget_max}
                    </Text>
                </View>
            )}

            <View style={styles.jobFooter}>
                {job.is_unlocked ? (
                    <>
                        <View style={styles.unlockedBadge}>
                            <Feather name="unlock" size={14} color="#10B981" style={{ marginRight: 4 }} />
                            <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
                        </View>
                        <View style={styles.viewLeadButtonInner}>
                            <Text style={styles.viewLeadText}>View Lead →</Text>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.creditBadge}>
                            <Text style={styles.creditText}>1 Credit</Text>
                        </View>
                        <Text style={styles.unlockText}>Unlock to Quote →</Text>
                    </>
                )}
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
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
        paddingBottom: hp(2),
        paddingHorizontal: wp(5),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        marginRight: wp(4),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: normalize(12),
        color: "#6B7280",
        marginTop: hp(0.2),
    },
    listContent: {
        padding: wp(4),
        paddingTop: hp(1),
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(12),
        alignItems: "center",
        marginTop: hp(5),
    },
    emptyIcon: {
        fontSize: normalize(64),
        marginBottom: hp(2),
    },
    emptyTitle: {
        fontSize: normalize(18),
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: hp(1),
    },
    emptyText: {
        fontSize: normalize(14),
        color: "#6B7280",
        textAlign: "center",
    },
    jobCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
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
        marginBottom: hp(1.5),
    },
    jobTitle: {
        flex: 1,
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1F2937",
        marginRight: wp(3),
    },
    newBadge: {
        backgroundColor: "#10B981",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
    },
    newText: {
        color: "#FFFFFF",
        fontSize: normalize(11),
        fontWeight: "700",
    },
    jobDetails: {
        flexDirection: "row",
        gap: wp(4),
        marginBottom: hp(1.5),
    },
    jobDetail: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailIcon: {
        fontSize: normalize(14),
        marginRight: wp(1.5),
    },
    detailText: {
        fontSize: normalize(14),
        color: "#6B7280",
    },
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(1.5),
    },
    budgetIcon: {
        fontSize: normalize(16),
        marginRight: wp(1.5),
    },
    budgetText: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#10B981",
    },
    jobFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    creditBadge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
    },
    creditText: {
        color: "#F59E0B",
        fontSize: normalize(13),
        fontWeight: "700",
    },
    unlockText: {
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "600",
    },
    unlockedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D1FAE5",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
    },
    unlockedBadgeText: {
        color: "#10B981",
        fontSize: normalize(13),
        fontWeight: "700",
    },
    viewLeadButtonInner: {
        backgroundColor: "#EBF5FF",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    viewLeadText: {
        fontSize: normalize(13),
        color: "#2563EB",
        fontWeight: "700",
    },
});
