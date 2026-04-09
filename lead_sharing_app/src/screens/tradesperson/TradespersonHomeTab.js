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
    Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { tradespersonAPI, jobAPI, userAPI, notificationAPI } from "../../services/api";
import { Feather } from '@expo/vector-icons';
import { normalize } from "../../utils/responsive";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TradespersonHomeTab({ navigation, route }) {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    useEffect(() => {
        loadData();
        checkUnreadNotifications();
    }, []);

    useEffect(() => {
        if (route.params?.payment === 'success' && route.params?.session_id) {
            handlePaymentSuccess(route.params.session_id);
        } else if (route.params?.payment === 'cancel') {
            Alert.alert("Payment Cancelled", "The payment process was cancelled.");
            navigation.setParams({ payment: undefined });
        }
    }, [route.params]);

    async function handlePaymentSuccess(sessionId) {
        try {
            setVerifyingPayment(true);
            const response = await tradespersonAPI.verifyPayment(sessionId);
            
            if (response.success) {
                Alert.alert(
                    "Payment Successful", 
                    `Successfully added ${response.credits} credits to your account. Your new balance is ${response.newBalance} credits.`
                );
                // Refresh data to show new credits
                loadData();
            } else {
                Alert.alert("Payment Verification Failed", response.message || "Please contact support if your credits don't appear shortly.");
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            Alert.alert("Payment Error", "There was an error verifying your payment. Please refresh your balance in a few moments.");
        } finally {
            setVerifyingPayment(false);
            // Clear params so we don't trigger this again on re-render
            navigation.setParams({ payment: undefined, session_id: undefined });
        }
    }

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

            // Sync global verification status if it has changed to APPROVED
            if (combinedProfile.verificationStatus === "APPROVED" && user.verificationStatus !== "APPROVED") {
                updateUser({ ...user, verificationStatus: "APPROVED" });
            }

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

    async function checkUnreadNotifications() {
        try {
            const response = await notificationAPI.getNotifications();
            if (response.success && response.notifications) {
                const hasUnread = response.notifications.some(n => !n.is_read || n.is_read === 0);
                setHasUnreadNotifications(hasUnread);
            }
        } catch (error) {
            // Silent fail - don't block UI
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    if (loading || verifyingPayment) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                {verifyingPayment && (
                    <Text style={styles.verifyingText}>Verifying payment...</Text>
                )}
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
            {/* Deletion Pending Banner */}
            {user?.accountStatus === 'PENDING_DELETION' || user?.deleteRequestPending ? (
                <TouchableOpacity 
                    style={styles.deletionBanner}
                    onPress={() => navigation.navigate("DeleteAccountRequest")}
                >
                    <Feather name="alert-triangle" size={normalize(20)} color="#FFFFFF" />
                    <Text style={styles.deletionBannerText}>Your account is scheduled for deletion</Text>
                    <Feather name="chevron-right" size={normalize(20)} color="#FFFFFF" />
                </TouchableOpacity>
            ) : null}

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                        {companyName}
                    </Text>
                </View>
           
                <View style={styles.headerRightActions}>
                    {/* <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("NotificationHistory");
                            setHasUnreadNotifications(false);
                        }}
                        style={styles.notificationHeaderIcon}
                    >
                        <View style={styles.bellWrapper}>
                            <Feather name="bell" size={normalize(24)} color="#4B5563" />
                            {hasUnreadNotifications && (
                                <View style={styles.redDot} />
                            )}
                        </View>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Profile")}
                        style={styles.profileButton}
                    >
                        <Feather name="user" size={normalize(20)} color="#4B5563" />
                    </TouchableOpacity>
                </View>
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
                            <Feather name="credit-card" size={normalize(20)} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={styles.creditsLabel}>Balance</Text>
                            <Text style={styles.creditsValue}>{credits} Credits</Text>
                        </View>
                    </View>
                    <View style={styles.topUpButton}>
                        <Text style={styles.topUpText}>Top Up</Text>
                        <Feather name="plus" size={normalize(14)} color="#2563EB" />
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
                        <Feather name="inbox" size={normalize(48)} color="#D1D5DB" />
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
                <Feather name={icon} size={normalize(16)} color={color} />
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
                    <Feather name="map-pin" size={normalize(12)} color="#6B7280" />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {job.city && job.postcode
                            ? `${job.city}, ${job.postcode}`
                            : job.postcode || job.city || "Location not specified"}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailItem}>
                    <Feather name="clock" size={normalize(12)} color="#6B7280" />
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
                <Feather name="dollar-sign" size={normalize(12)} color="#6B7280" />
                <Text style={styles.budgetText}>
                    {job.budget_min ? `${job.budget_min} - ${job.budget_max}` : "Budget N/A"}
                </Text>
            </View>

            <View style={styles.tapHint}>
                {job.is_unlocked ? (
                    <Text style={styles.unlockedText}>View Lead</Text>
                ) : (
                    <Text style={styles.costText}>1 Credit</Text>
                )}
                <Feather name="chevron-right" size={normalize(16)} color="#D1D5DB" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding:isTablet?15:0
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
    verifyingText: {
        marginTop: 12,
        fontSize: normalize(16),
        color: "#6B7280",
        fontWeight: "500",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        // marginTop: 40,
        marginBottom: 10,
    },
    headerRightActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    notificationHeaderIcon: {
        marginRight: 15,
    },
    bellWrapper: {
        position: 'relative',
    },
    redDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    greeting: {
        fontSize: normalize(isTablet ? 17 : 14),
        color: "#6B7280",
        marginBottom: 4,
    },
    companyName: {
        fontSize: normalize(isTablet ? 18 : 16),
        fontWeight: "800",
        color: "#111827",
        maxWidth: width * 0.7,
    },
    profileButton: {
        width: isTablet ? 52 : 40,
        height: isTablet ? 52 : 40,
        borderRadius: isTablet ? 26 : 20,
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
        padding: isTablet ? 28 : 20,
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
        justifyContent:"space-between"
    },
    creditsIconBadge: {
        width: isTablet ? 56 : 44,
        height: isTablet ? 56 : 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    creditsLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: normalize(13),
        fontWeight: "500",
    },
    creditsValue: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },
    topUpButton: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: isTablet ? 20 : 16,
        paddingVertical: isTablet ? 13 : 10,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    topUpText: {
        color: "#2563EB",
        fontSize: normalize(isTablet ? 15 : 13),
        fontWeight: "700",
    },
    statsContainer: {
        paddingHorizontal: 10,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: normalize(isTablet ? 22 : 18),
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        // gap: 10,
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: isTablet ? 20 : 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    statIconContainer: {
        width: isTablet ? 48 : 36,
        height: isTablet ? 48 : 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    statContent: {
        gap: 4,
    },
    statValue: {
        fontSize: normalize(isTablet ? 26 : 20),
        fontWeight: "700",
        color: "#111827",
    },
    statLabel: {
        fontSize: normalize(isTablet ? 15 : 13),
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
        fontSize: normalize(isTablet ? 16 : 14),
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
        fontSize: normalize(isTablet ? 18 : 16),
        fontWeight: "600",
        color: "#374151",
        marginTop: 12,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: normalize(isTablet ? 16 : 14),
        color: "#9CA3AF",
        textAlign: "center",
    },
    jobCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: isTablet ? 20 : 16,
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
        fontSize: normalize(isTablet ? 19 : 16),
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
        fontSize: normalize(isTablet ? 12 : 10),
        fontWeight: "700",
        textTransform: "uppercase",
    },
    categoryRow: {
        marginBottom: 8,
    },
    categoryText: {
        fontSize: normalize(isTablet ? 14 : 12),
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
        fontSize: normalize(isTablet ? 15 : 13),
        color: "#6B7280",
        maxWidth: 850,
    },
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    budgetText: {
        fontSize: normalize(isTablet ? 15 : 13),
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
        fontSize: normalize(isTablet ? 14 : 12),
        fontWeight: "600",
        color: "#F59E0B",
    },
    unlockedText: {
        fontSize: normalize(isTablet ? 14 : 12),
        fontWeight: "700",
        color: "#2563EB",
    },
    footerSpace: {
        height: 100,
    },
    deletionBanner: {
        marginHorizontal: 20,
        marginTop: isTablet?45:40,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deletionBannerText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: normalize(isTablet ? 16 : 14),
        fontWeight: '600',
        marginHorizontal: 12,
    },
});
