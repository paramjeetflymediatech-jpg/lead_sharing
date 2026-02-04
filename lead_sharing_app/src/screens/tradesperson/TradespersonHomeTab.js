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
import { tradespersonAPI, jobAPI } from "../../services/api";

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
            const [profileData, jobsData] = await Promise.all([
                tradespersonAPI.getProfile().catch(() => null),
                jobAPI.getAll().catch(() => ({})),
            ]);

            setProfile(profileData);

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
                <Text style={styles.companyName}>{profile?.company_name || user?.name || "Tradesperson"}</Text>
            </View>

            {/* Credits Card */}
            <TouchableOpacity style={styles.creditsCard} onPress={() => navigation.navigate("BuyCredits")}>
                <View style={styles.creditsLeft}>
                    <View style={styles.creditsIconContainer}>
                        <Text style={styles.creditsIcon}>💳</Text>
                    </View>
                    <View>
                        <Text style={styles.creditsLabel}>Available Credits</Text>
                        <Text style={styles.creditsValue}>{credits}</Text>
                    </View>
                </View>
                <View style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>Buy More</Text>
                </View>
            </TouchableOpacity>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard icon="📋" value={0} label="Active Leads" color="#F59E0B" />
                <StatCard icon="🔓" value={0} label="Unlocked" color="#10B981" />
                <StatCard icon="🏗️" value={recentJobs.length} label="Available" color="#2563EB" />
                <StatCard icon="👁️" value={profileViews} label="Views" color="#8B5CF6" />
            </View>

            {/* Recent Opportunities */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Opportunities</Text>
                    {recentJobs.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate("Browse")}>
                            <Text style={styles.viewAllText}>View All →</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {recentJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No jobs available</Text>
                        <Text style={styles.emptyText}>Check back later for new opportunities</Text>
                    </View>
                ) : (
                    recentJobs.map((job, index) => <JobCard key={job.id || index} job={job} credits={credits} navigation={navigation} />)
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

function JobCard({ job, credits, navigation }) {
    const canAfford = credits >= 1;

    return (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate("JobDetails", { jobId: job.id })}
        >
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

            <View style={styles.jobInfo}>
                <Text style={styles.jobInfoText}>📍 {job.postcode || "N/A"}</Text>
                <Text style={styles.jobInfoText}>
                    💰 £{job.budget_min || 0} -{job.budget_max || 0}
                </Text>
            </View>

            <View style={styles.jobFooter}>
                <Text style={styles.creditCost}>1 Credit to unlock</Text>
                <Text style={styles.viewDetails}>View Details →</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        paddingTop: 20,
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
        marginTop: 20,
    },
    greeting: {
        fontSize: 15,
        color: "#6B7280",
    },
    companyName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 4,
    },
    creditsCard: {
        backgroundColor: "#2563EB",
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    creditsLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    creditsIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    creditsIcon: {
        fontSize: 24,
    },
    creditsLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.9)",
        marginBottom: 4,
    },
    creditsValue: {
        fontSize: 32,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    buyButton: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    buyButtonText: {
        color: "#2563EB",
        fontSize: 14,
        fontWeight: "700",
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
    lowCreditsTag: {
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    lowCreditsText: {
        color: "#DC2626",
        fontSize: 11,
        fontWeight: "600",
    },
    jobInfo: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    jobInfoText: {
        fontSize: 13,
        color: "#6B7280",
    },
    jobFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    creditCost: {
        fontSize: 13,
        color: "#F59E0B",
        fontWeight: "600",
    },
    viewDetails: {
        fontSize: 13,
        color: "#2563EB",
        fontWeight: "600",
    },
});
