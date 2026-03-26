import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { homeownerAPI } from "../../services/api";
import { API_BASE_URL } from "../../config/api";
import { normalize, wp, hp } from "../../utils/responsive";
import RatingModal from "../../components/RatingModal";

export default function JobDetailsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedTradespersonName, setSelectedTradespersonName] = useState('');
    const [selectedTradespersonId, setSelectedTradespersonId] = useState(null);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    async function loadJobDetails() {
        try {
            setLoading(true);
            const [jobResponse, leadsData] = await Promise.all([
                homeownerAPI.getJob(jobId).catch(() => null),
                homeownerAPI.getJobLeads(jobId).catch(() => []),
            ]);

            // Extract job from the response structure: { success, data: { ...job, leadCount }, message }
            // The API returns job fields at the top level of `data` (e.g. data.id, data.has_rated)
            // But sometimes it might be nested in `data.job` depending on the endpoint variant.

            // Check if jobResponse IS the data object or if it has a .data property
            // The apiCall wrapper returns response.json(), so jobResponse = { success: true, data: { ... } }
            // Or if it failed, maybe something else.

            // Assuming jobResponse.data IS the job object (from route.js verified earlier)
            const jobData = jobResponse?.data?.job || jobResponse?.data || jobResponse;

            console.log('📝 LOADED JOB DATA:', {
                id: jobData?.id || jobData?._id,
                status: jobData?.status,
                has_rated: jobData?.has_rated,
                hasRated: jobData?.hasRated
            });

            setJob(jobData);

            // Extract leads: API returns { success, data: [...leads], count }
            const leadsList = Array.isArray(leadsData) ? leadsData : leadsData?.data || leadsData?.leads || [];
            console.log('Leads data:', leadsData);
            console.log('Extracted leads:', leadsList);
            setLeads(leadsList);
            return { job: jobData, leads: leadsList };
        } catch (error) {
            console.error("Error loading job details:", error);
            Alert.alert("Error", "Failed to load job details");
            return { job: null, leads: [] };
        } finally {
            setLoading(false);
        }
    }

    async function handleHire(leadId) {
        Alert.alert(
            "Hire Tradesperson",
            "Are you sure you want to hire this tradesperson?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Hire",
                    onPress: async () => {
                        try {
                            await homeownerAPI.hireTradesperson(jobId, leadId);
                            Alert.alert("Success", "Tradesperson hired successfully!");
                            loadJobDetails();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to hire tradesperson");
                        }
                    },
                },
            ]
        );
    }

    async function handleCompleteJob() {
        Alert.alert(
            "Complete Job",
            "Mark this job as completed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Complete",
                    onPress: async () => {
                        try {
                            await homeownerAPI.completeJob(jobId);
                            Alert.alert("Success", "Job marked as completed!");

                            // Reload job details and wait for it to complete
                            const { job: updatedJob, leads: updatedLeads } = await loadJobDetails();

                            // Show rating modal after job details are refreshed
                            // Look for hired tradesperson in the updated data
                            const hiredTradespersonId = updatedJob?.hired_tradesperson_id;

                            console.log('Updated job hired_tradesperson_id:', hiredTradespersonId);
                            console.log('Updated leads:', updatedLeads);

                            // If job doesn't have hired_tradesperson_id, try to find from leads with HIRED status
                            let tradespersonId = hiredTradespersonId;
                            let tradespersonName = updatedJob?.hired_tradesperson_name;

                            if (!tradespersonId) {
                                const hiredLead = updatedLeads.find(l => l.status === 'HIRED');
                                console.log('Found hired lead:', hiredLead);
                                if (hiredLead) {
                                    tradespersonId = hiredLead.tradesperson_id;
                                    tradespersonName = hiredLead.tradesperson_name || hiredLead.company_name;
                                }
                            }

                            console.log('Final tradesperson ID:', tradespersonId);
                            console.log('Final tradesperson name:', tradespersonName);

                            if (tradespersonId) {
                                setSelectedTradespersonName(tradespersonName || 'this tradesperson');
                                setSelectedTradespersonId(tradespersonId);
                                setRatingModalVisible(true);
                            }
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to complete job");
                        }
                    },
                },
            ]
        );
    }

    async function handleSubmitRating(rating, review) {
        if (!selectedTradespersonId) {
            Alert.alert("Error", "Tradesperson information missing");
            console.error("❌ Stats: Tradesperson ID is null or undefined");
            return;
        }

        console.log("📝 Submitting rating:", {
            jobId,
            tradespersonId: selectedTradespersonId,
            rating,
            review
        });

        try {
            await homeownerAPI.rateJob(jobId, selectedTradespersonId, rating, review);
            Alert.alert("Success", "Thank you for your feedback!");
            // Reload job details to update has_rated field and hide rating button
            await loadJobDetails();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to submit rating");
            throw error;
        }
    }

    function handleViewProfile(tradespersonId) {
        navigation.navigate('TradespersonProfile', { tradespersonId });
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Job not found</Text>
            </View>
        );
    }

    const getStatusUI = (status) => {
        switch (status) {
            case "OPEN":
                return {
                    label: "Finding Tradespeople",
                    color: "#059669", // Emerald 600
                    bgColor: "#ECFDF5", // Emerald 50
                    icon: "search"
                };
            case "HIRED":
                return {
                    label: "Tradesperson Hired",
                    color: "#2563EB", // Blue 600
                    bgColor: "#EFF6FF", // Blue 50
                    icon: "user-check"
                };
            case "COMPLETED":
                return {
                    label: "Job Completed",
                    color: "#7C3AED", // Purple 600
                    bgColor: "#F5F3FF", // Purple 50
                    icon: "check-circle"
                };
            case "CANCELLED":
                return {
                    label: "Job Cancelled",
                    color: "#DC2626", // Red 600
                    bgColor: "#FEF2F2", // Red 50
                    icon: "x-circle"
                };
            default:
                return {
                    label: status || "Unknown",
                    color: "#4B5563", // Gray 600
                    bgColor: "#F3F4F6", // Gray 50
                    icon: "help-circle"
                };
        }
    };

    // Normalize image URLs
    const imageUrls = Array.isArray(job.media)
        ? job.media.map((m) => (typeof m === "string" ? m : m && m.url)).filter(Boolean)
        : [];
    const fullImageUrls = imageUrls.map((url) =>
        url && url.startsWith("http")
            ? url
            : `${API_BASE_URL.replace(/\/$/, "")}${url && url.startsWith("/") ? url : "/" + (url || "")}`
    );

    return (
        <ScrollView style={styles.container}>
            {/* Job Header */}
            <View style={styles.header}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusUI(job.status).bgColor, borderColor: getStatusUI(job.status).color }]}>
                    <Feather name={getStatusUI(job.status).icon} size={14} color={getStatusUI(job.status).color} style={{ marginRight: 6 }} />
                    <Text style={[styles.statusText, { color: getStatusUI(job.status).color }]}>{getStatusUI(job.status).label}</Text>
                </View>
                <Text style={styles.title}>{job.description}</Text>
            </View>

            {/* Job Photos */}
            {fullImageUrls.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                        {fullImageUrls.map((uri, index) => (
                            <Image
                                key={index}
                                source={{ uri }}
                                style={styles.jobImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Job Details */}
            <View style={styles.card}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>
                            {job.city && job.postcode
                                ? `${job.city}, ${job.postcode}`
                                : job.postcode || job.city || "Location not specified"}
                        </Text>
                    </View>
                </View>

                {job.budget_max && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>💰</Text>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Budget</Text>
                            <Text style={styles.detailValue}>
                                ${job.budget_min || 0} - ${job.budget_max}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Start Time</Text>
                        <Text style={styles.detailValue}>
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

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🏠</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Property Type</Text>
                        <Text style={styles.detailValue}>
                            {job.ownership
                                ? job.ownership.charAt(0) + job.ownership.slice(1).toLowerCase()
                                : "Not specified"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Interested Tradespeople */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Interested Tradespeople ({leads.length})
                </Text>

                {leads.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👷</Text>
                        <Text style={styles.emptyTitle}>No quotes yet</Text>
                        <Text style={styles.emptyText}>
                            Tradespeople will appear here when they express interest
                        </Text>
                    </View>
                ) : (
                    leads.map((lead, index) => (
                        <View key={lead.id || index} style={styles.leadCard}>
                            <View style={styles.leadHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.leadName}>{lead.tradesperson_name || "Tradesperson"}</Text>
                                    {lead.company_name && (
                                        <Text style={styles.leadCompany}>{lead.company_name}</Text>
                                    )}
                                </View>
                                <View style={styles.actionButtons}>
                                    {lead.status === 'REJECTED' ? (
                                        <View style={styles.rejectedBadge}>
                                            <Feather name="x-circle" size={14} color="#EF4444" />
                                            <Text style={styles.rejectedText}>Rejected</Text>
                                        </View>
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                style={styles.viewProfileButton}
                                                onPress={() => handleViewProfile(lead.tradesperson_id)}
                                            >
                                                <Feather name="user" size={16} color="#2563EB" />
                                                <Text style={styles.viewProfileText}>View Profile</Text>
                                            </TouchableOpacity>
                                            {job.status === "OPEN" && (
                                                <TouchableOpacity
                                                    style={styles.hireButton}
                                                    onPress={() => handleHire(lead.id)}
                                                >
                                                    <Text style={styles.hireButtonText}>Hire</Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
                            </View>
                            {lead.status === 'HIRED' && (
                                <View style={styles.hiredBanner}>
                                    <Feather name="check-circle" size={14} color="#10B981" />
                                    <Text style={styles.hiredBannerText}>You hired this tradesperson</Text>
                                </View>
                            )}
                            {lead.message && (
                                <Text style={styles.leadMessage}>{lead.message}</Text>
                            )}
                            {lead.price_estimate && (
                                <Text style={styles.priceEstimate}>
                                    Estimate: ${lead.price_estimate}
                                </Text>
                            )}
                        </View>
                    ))
                )}
            </View>

            {/* Complete Job Button (shown when HIRED) */}
            {job.status === "HIRED" && (
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.completeJobButton}
                        onPress={handleCompleteJob}
                    >
                        <Feather name="check-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.completeJobButtonText}>Click here to complete the job</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Rating Section (shown when COMPLETED and not rated) */}
            {job.status === "COMPLETED" && !(job.has_rated || job.hasRated) && (
                <View style={styles.section}>
                    <View style={styles.ratingPrompt}>
                        <Feather name="star" size={24} color="#FCD34D" />
                        <Text style={styles.ratingPromptTitle}>Rate Your Experience</Text>
                        <Text style={styles.ratingPromptText}>
                            How was your experience with this tradesperson?
                        </Text>
                        <TouchableOpacity
                            style={styles.rateNowButton}
                            onPress={() => {
                                const hiredLead = leads.find(l => l.status === 'HIRED');
                                if (hiredLead) {
                                    setSelectedTradespersonName(hiredLead.tradesperson_name || 'this tradesperson');
                                    setSelectedTradespersonId(hiredLead.tradesperson_id);
                                } else if (job?.hired_tradesperson_id) {
                                    setSelectedTradespersonName(job.hired_tradesperson_name || 'this tradesperson');
                                    setSelectedTradespersonId(job.hired_tradesperson_id);
                                }
                                setRatingModalVisible(true);
                            }}
                        >
                            <Text style={styles.rateNowButtonText}>Rate Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Rating Submitted Message */}
            {job.status === "COMPLETED" && (job.has_rated || job.hasRated) && (
                <View style={styles.section}>
                    <View style={styles.ratedMessage}>
                        <Feather name="check-circle" size={24} color="#10B981" />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.ratedTitle}>Rating Submitted</Text>
                            <Text style={styles.ratedText}>Thank you for rating this tradesperson!</Text>
                        </View>
                    </View>
                </View>
            )}

            <RatingModal
                visible={ratingModalVisible}
                onClose={() => setRatingModalVisible(false)}
                onSubmit={handleSubmitRating}
                tradespersonName={selectedTradespersonName}
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
    },
    errorText: {
        fontSize: normalize(16),
        color: "#6B7280",
    },
    header: {
        padding: wp(5),
        paddingTop: wp(4),
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.6),
        borderRadius: wp(1.5),
        marginBottom: hp(1.5),
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
    },
    statusText: {
        fontSize: normalize(12),
        fontWeight: "600",
        textTransform: "capitalize",
    },
    title: {
        fontSize: normalize(12),
        fontWeight: "500",
        color: "#1F2937",
        lineHeight: normalize(17),
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: wp(4),
        marginBottom: hp(2.5),
        borderRadius: wp(3),
        padding: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: hp(2),
    },
    detailIcon: {
        fontSize: normalize(20),
        marginRight: wp(3),
        marginTop: hp(0.2),
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: normalize(13),
        color: "#6B7280",
        marginBottom: hp(0.2),
    },
    detailValue: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: "#1F2937",
    },
    section: {
        paddingHorizontal: wp(4),
        marginBottom: hp(2.5),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: hp(1.5),
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(10),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyIcon: {
        fontSize: normalize(50),
        marginBottom: hp(1.5),
    },
    emptyTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: hp(0.8),
    },
    emptyText: {
        fontSize: normalize(14),
        color: "#6B7280",
        textAlign: "center",
    },
    imagesScroll: {
        marginTop: hp(0.5),
    },
    jobImage: {
        width: wp(80),
        height: wp(60),
        borderRadius: wp(3),
        backgroundColor: "#E5E7EB",
        marginRight: wp(3),
    },
    leadCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    leadHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: hp(1),
    },
    leadName: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1F2937",
    },
    leadCompany: {
        fontSize: normalize(13),
        color: "#6B7280",
        marginTop: hp(0.2),
    },
    leadMessage: {
        fontSize: normalize(14),
        color: "#4B5563",
        lineHeight: normalize(20),
        marginTop: hp(1),
    },
    hireButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(2),
        marginLeft: wp(2),
    },
    hireButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(13),
        fontWeight: "700",
    },
    actionButtons: {
        flexDirection: 'row',
        gap: normalize(8),
        alignItems: 'center',
    },
    viewProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(4),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(6),
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
    },
    viewProfileText: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: '#2563EB',
    },
    priceEstimate: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#10B981',
        marginTop: hp(0.5),
    },
    completeJobButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        backgroundColor: '#10B981',
        paddingVertical: normalize(14),
        borderRadius: 8,
        marginTop: hp(1),
    },
    completeJobButtonText: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    ratingPrompt: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: normalize(20),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    ratingPromptTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#92400E',
        marginTop: hp(1),
        marginBottom: hp(0.5),
    },
    ratingPromptText: {
        fontSize: normalize(14),
        color: '#78350F',
        textAlign: 'center',
        marginBottom: hp(2),
    },
    rateNowButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: normalize(24),
        paddingVertical: normalize(12),
        borderRadius: 8,
    },
    rateNowButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    ratedMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(8),
        backgroundColor: '#D1FAE5',
        paddingVertical: normalize(16),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    ratedTitle: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: '#065F46',
        marginBottom: 2,
    },
    ratedText: {
        fontSize: normalize(14),
        fontWeight: '500',
        color: '#065F46',
    },
    rejectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(4),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(6),
        borderRadius: 6,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    rejectedText: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: '#EF4444',
    },
    hiredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
        backgroundColor: '#ECFDF5',
        paddingHorizontal: normalize(8),
        paddingVertical: normalize(4),
        borderRadius: 4,
        marginTop: hp(0.5),
        alignSelf: 'flex-start',
    },
    hiredBannerText: {
        fontSize: normalize(11),
        fontWeight: '600',
        color: '#10B981',
    },
});
