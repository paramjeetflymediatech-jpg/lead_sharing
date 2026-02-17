import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { homeownerAPI } from "../../services/api";
import { normalize, wp, hp } from "../../utils/responsive";

export default function JobDetailsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    async function loadJobDetails() {
        try {
            setLoading(true);
            const [jobData, leadsData] = await Promise.all([
                homeownerAPI.getJob(jobId).catch(() => null),
                homeownerAPI.getJobLeads(jobId).catch(() => []),
            ]);

            setJob(jobData);

            const leadsList = Array.isArray(leadsData) ? leadsData : leadsData?.leads || [];
            setLeads(leadsList);
        } catch (error) {
            console.error("Error loading job details:", error);
            Alert.alert("Error", "Failed to load job details");
        } finally {
            setLoading(false);
        }
    }

    async function handleHire(tradespersonId) {
        Alert.alert(
            "Hire Tradesperson",
            "Are you sure you want to hire this tradesperson?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Hire",
                    onPress: async () => {
                        try {
                            await homeownerAPI.hireTradesperson(jobId, tradespersonId);
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
        <ScrollView style={styles.container}>
            {/* Job Header */}
            <View style={styles.header}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <Text style={styles.statusText}>{job.status}</Text>
                </View>
                <Text style={styles.title}>{job.description}</Text>
            </View>

            {/* Job Details */}
            <View style={styles.card}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{job.postcode}</Text>
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
                            {job.start_time?.replace(/_/g, " ") || "Flexible"}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🏠</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Property Type</Text>
                        <Text style={styles.detailValue}>{job.property_type || "Not specified"}</Text>
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
                                <View>
                                    <Text style={styles.leadName}>{lead.tradesperson_name || "Tradesperson"}</Text>
                                    {lead.company && (
                                        <Text style={styles.leadCompany}>{lead.company}</Text>
                                    )}
                                </View>
                                {job.status === "OPEN" && (
                                    <TouchableOpacity
                                        style={styles.hireButton}
                                        onPress={() => handleHire(lead.tradesperson_id)}
                                    >
                                        <Text style={styles.hireButtonText}>Hire</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {lead.message && (
                                <Text style={styles.leadMessage}>{lead.message}</Text>
                            )}
                        </View>
                    ))
                )}
            </View>

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
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
        marginBottom: hp(1.5),
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: normalize(13),
        fontWeight: "700",
    },
    title: {
        fontSize: normalize(22),
        fontWeight: "700",
        color: "#1F2937",
        lineHeight: normalize(30),
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
});
