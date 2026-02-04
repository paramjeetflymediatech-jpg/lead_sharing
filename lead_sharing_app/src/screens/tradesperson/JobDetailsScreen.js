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
import { jobAPI, tradespersonAPI } from "../../services/api";

export default function JobDetailsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    async function loadJobDetails() {
        try {
            setLoading(true);
            const jobData = await jobAPI.getById(jobId);
            setJob(jobData);
        } catch (error) {
            console.error("Error loading job details:", error);
            Alert.alert("Error", "Failed to load job details");
        } finally {
            setLoading(false);
        }
    }

    async function handleUnlock() {
        Alert.alert(
            "Unlock Lead",
            "This will cost 1 credit. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unlock",
                    onPress: async () => {
                        try {
                            setUnlocking(true);
                            await tradespersonAPI.unlockLead(jobId);
                            Alert.alert("Success", "Lead unlocked! You can now contact the homeowner.");
                            loadJobDetails();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to unlock lead");
                        } finally {
                            setUnlocking(false);
                        }
                    },
                },
            ]
        );
    }

    async function handleSubmitQuote() {
        Alert.prompt(
            "Submit Quote",
            "Enter your message to the homeowner:",
            async (message) => {
                if (!message || !message.trim()) return;

                try {
                    await tradespersonAPI.submitLead({
                        job_id: jobId,
                        message: message.trim(),
                    });
                    Alert.alert("Success", "Quote submitted successfully!");
                    navigation.goBack();
                } catch (error) {
                    Alert.alert("Error", error.message || "Failed to submit quote");
                }
            }
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

    const isUnlocked = job.is_unlocked || false;

    return (
        <ScrollView style={styles.container}>
            {/* Job Header */}
            <View style={styles.header}>
                <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
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
                                £{job.budget_min || 0} - £{job.budget_max}
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

                {isUnlocked && job.homeowner_name && (
                    <View style={styles.contactSection}>
                        <Text style={styles.contactTitle}>Contact Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>👤</Text>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Homeowner</Text>
                                <Text style={styles.detailValue}>{job.homeowner_name}</Text>
                            </View>
                        </View>
                        {job.homeowner_phone && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailIcon}>📞</Text>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Phone</Text>
                                    <Text style={styles.detailValue}>{job.homeowner_phone}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            {!isUnlocked && (
                <View style={styles.actionSection}>
                    <View style={styles.creditInfo}>
                        <Text style={styles.creditIcon}>💳</Text>
                        <Text style={styles.creditText}>1 Credit Required</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.unlockButton, unlocking && styles.buttonDisabled]}
                        onPress={handleUnlock}
                        disabled={unlocking}
                    >
                        {unlocking ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.unlockButtonText}>Unlock Lead</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {isUnlocked && (
                <TouchableOpacity
                    style={styles.quoteButton}
                    onPress={handleSubmitQuote}
                >
                    <Text style={styles.quoteButtonText}>Submit Quote</Text>
                </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
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
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
    },
    errorText: {
        fontSize: 16,
        color: "#6B7280",
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    newBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#10B981",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    newText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        lineHeight: 30,
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    detailIcon: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
    },
    contactSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    actionSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    creditInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF3C7",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    creditIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    creditText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#F59E0B",
    },
    unlockButton: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    unlockButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    quoteButton: {
        backgroundColor: "#10B981",
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    quoteButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
});
