import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { tradespersonAPI, jobAPI, userAPI } from "../../services/api";
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TradespersonHomeTab({ navigation }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [profileData, jobsData, userData, leadsData] = await Promise.all([
                tradespersonAPI.getProfile().catch(() => null),
                jobAPI.getAll().catch(() => ({})),
                userAPI.getMe().catch(() => null),
                tradespersonAPI.getMyLeads().catch(() => ({})),
            ]);

            // Combine data, prioritizing getMe() for credits
            const credits = userData?.credits ??
                userData?.tradespersonProfile?.credits ??
                userData?.user?.credits ??
                profileData?.credits ??
                0;

            const leadsStats = leadsData?.data?.stats || leadsData?.stats || { total: 0 };

            const combinedProfile = {
                ...profileData,
                credits: credits,
                user: userData?.user || userData
            };

            setProfile(combinedProfile);

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

    const credits = profile?.credits || 0;
    const profileViews = profile?.profile_views || 0;
    const companyName = profile?.company_name || user?.name || "Tradesperson";

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                        {companyName}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.profileButton}>
                    <Feather name="user" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            {/* Credits Card */}
            <TouchableOpacity
                style={styles.creditsCard}
                onPress={() => navigation.navigate("BuyCredits")}
                activeOpacity={0.9}
            >
                <View style={styles.creditsContent}>
                    <View style={styles.creditsInfo}>
                        <View style={styles.creditsIconBadge}>
                            <Feather name="credit-card" size={20} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={styles.creditsLabel}>Balance</Text>
                            <Text style={styles.creditsValue}>{credits} Credits</Text>
                        </View>
                    </View>
                    <View style={styles.topUpButton}>
                        <Text style={styles.topUpText}>Top Up</Text>
                        <Feather name="plus" size={14} color="#2563EB" />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Stats Grid */}
            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="briefcase"
                        value={profile?.unlockedLeadsCount || 0}
                        label="My Leads"
                        color="#F59E0B"
                    />
                    <StatCard
                        icon="unlock"
                        value={profile?.unlockedLeadsCount || 0}
                        label="Unlocked"
                        color="#10B981"
                    />
                    <StatCard
                        icon="layers"
                        value={recentJobs.length}
                        label="Marketplace"
                        color="#2563EB"
                    />
                    <StatCard
                        icon="eye"
                        value={profileViews}
                        label="Views"
                        color="#8B5CF6"
                    />
                </View>
            </View>

            {/* Recent Opportunities */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Jobs</Text>
                    {recentJobs.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Browse")}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {recentJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="inbox" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No jobs yet</Text>
                        <Text style={styles.emptyText}>New opportunities will appear here.</Text>
                    </View>
                ) : (
                    recentJobs.map((job, index) => (
                        <JobCard
                            key={job.id || index}
                            job={job}
                            credits={credits}
                            navigation={navigation}
                        />
                    ))
                )}
            </View>

            <View style={styles.footerSpace} />
        </ScrollView>
    );
}

function StatCard({ icon, value, label, color }) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
                <Feather name={icon} size={20} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
            </View>
        </View>
    );
}

function JobCard({ job, credits, navigation }) {
    const canAfford = credits >= 1;

    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate("JobDetails", { jobId: job._id })}
            activeOpacity={0.7}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.description || "Job Request"}
                </Text>
                {!canAfford && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Low Credits</Text>
                    </View>
                )}
            </View>

            {(job.category_name || job.subcategory_name) && (
                <View style={styles.categoryRow}>
                    <Text style={styles.categoryText} numberOfLines={1}>
                        {[job.category_name, job.subcategory_name].filter(Boolean).join(" › ")}
                    </Text>
                </View>
            )}

            <View style={styles.jobDetails}>
                <View style={styles.detailItem}>
                    <Feather name="map-pin" size={12} color="#6B7280" />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {job.city && job.postcode
                            ? `${job.city}, ${job.postcode}`
                            : job.postcode || job.city || "Location not specified"}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailItem}>
                    <Feather name="clock" size={12} color="#6B7280" />
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

            <View style={styles.budgetRow}>
                <Feather name="dollar-sign" size={12} color="#6B7280" />
                <Text style={styles.budgetText}>
                    {job.budget_min ? `${job.budget_min} - ${job.budget_max}` : "Budget N/A"}
                </Text>
            </View>

            <View style={styles.tapHint}>
                {job.is_unlocked ? (
                    <Text style={styles.unlockedText}>Unlocked</Text>
                ) : (
                    <Text style={styles.costText}>1 Credit</Text>
                )}
                <Feather name="chevron-right" size={16} color="#D1D5DB" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentContainer: {
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 4,
    },
    companyName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        maxWidth: width * 0.7,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    creditsCard: {
        backgroundColor: "#2563EB",
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    creditsContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    creditsInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    creditsIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    creditsLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        fontWeight: "500",
    },
    creditsValue: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },
    topUpButton: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    topUpText: {
        color: "#2563EB",
        fontSize: 13,
        fontWeight: "700",
    },
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 52) / 2, // Responsive grid (screen width - margins - gap) / 2
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    statContent: {
        gap: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    statLabel: {
        fontSize: 13,
        color: "#6B7280",
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "600",
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        borderStyle: "dashed",
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginTop: 12,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    jobCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    jobHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    jobTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginRight: 10,
    },
    badge: {
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: "#EF4444",
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    categoryRow: {
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        color: "#6B7280",
    },
    jobDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#6B7280",
        maxWidth: 150, // Added to prevent pushing other items
    },
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    budgetText: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "600",
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 12,

    },
    tapHint: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F9FAFB",
    },
    costText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#F59E0B",
    },
    unlockedText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#10B981",
    },
    footerSpace: {
        height: 100, // Space for floating tab bar
    },
});
