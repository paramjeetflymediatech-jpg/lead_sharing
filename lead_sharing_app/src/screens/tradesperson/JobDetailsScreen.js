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
import UnlockLeadModal from "../../components/UnlockLeadModal";
import MessagesModal from "../../screens/MessagesModal";
import SuccessModal from "../../components/SuccessModal";
import { normalize, wp, hp } from "../../utils/responsive";

export default function JobDetailsScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Added for success modal

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    async function loadJobDetails(showLoader = true) {
        try {
            if (showLoader) setLoading(true);
            const jobData = await jobAPI.getById(jobId);
            setJob(jobData);
        } catch (error) {
            console.error("Error loading job details:", error);
            Alert.alert("Error", "Failed to load job details");
        } finally {
            if (showLoader) setLoading(false);
        }
    }

    function handleUnlockClick() {
        setShowUnlockModal(true);
    }

    async function handleUnlockConfirm({ message, priceEstimate }) {
        try {
            setUnlocking(true);
            console.log("Unlocking lead with:", { jobId, message, priceEstimate });
            await tradespersonAPI.unlockLeadWithDetail({
                jobId,
                message,
                priceEstimate // Backend expects string (calls .trim())
            });

            // Close modal first
            setShowUnlockModal(false);

            // Show success styling (or simple alert for now)
            // Alert.alert("Success", "Lead unlocked! Your quote has been sent.");
            setShowSuccessModal(true);
            loadJobDetails(false); // Silent reload to update UI in background
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to unlock lead");
        } finally {
            setUnlocking(false);
        }
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
            {/* Modal */}
            <UnlockLeadModal
                visible={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                onUnlock={handleUnlockConfirm}
                loading={unlocking}
                cost={1}
            />

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
                        onPress={handleUnlockClick}
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
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.quoteButton}
                        onPress={handleSubmitQuote}
                    >
                        <Text style={styles.quoteButtonText}>Submit Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.messageButton}
                        onPress={() => setShowMessageModal(true)}
                    >
                        <Text style={styles.messageButtonText}>Message Homeowner</Text>
                    </TouchableOpacity>
                </View>
            )}

            <MessagesModal
                visible={showMessageModal}
                onClose={() => setShowMessageModal(false)}
                jobId={job._id}
                homeownerId={job.homeowner?.id}
                jobTitle={job.description}
            />

            <View style={{ height: 40 }} />

            <SuccessModal
                visible={showSuccessModal}
                title="Lead Unlocked!"
                subtitle="You can now view the homeowner's contact details and send them a message."
                buttonText="View Contact"
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.navigate('JobDetails', { jobId });
                }}
            />
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
        padding: wp(5),
        paddingTop: hp(2),
    },
    newBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#10B981",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(2),
        marginBottom: hp(1.5),
    },
    newText: {
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
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: normalize(13),
        color: "#6B7280",
        marginBottom: hp(0.25),
    },
    detailValue: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: "#1F2937",
    },
    contactSection: {
        marginTop: hp(2),
        paddingTop: hp(2),
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    contactTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: hp(1.5),
    },
    actionSection: {
        paddingHorizontal: wp(4),
        marginBottom: hp(2.5),
    },
    creditInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF3C7",
        padding: wp(3),
        borderRadius: wp(2.5),
        marginBottom: hp(1.5),
    },
    creditIcon: {
        fontSize: normalize(18),
        marginRight: wp(2),
    },
    creditText: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#F59E0B",
    },
    unlockButton: {
        backgroundColor: "#2563EB",
        borderRadius: wp(3),
        padding: wp(4),
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
        fontSize: normalize(17),
        fontWeight: "700",
    },
    quoteButton: {
        backgroundColor: "#10B981",
        marginHorizontal: wp(4),
        borderRadius: wp(3),
        padding: wp(4),
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    quoteButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(17),
        fontWeight: "700",
    },
    actionRow: {
        paddingHorizontal: wp(4),
        gap: hp(1.5),
    },
    messageButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#2563EB",
        borderRadius: wp(3),
        padding: wp(4),
        alignItems: "center",
        marginTop: hp(1.5),
    },
    messageButtonText: {
        color: "#2563EB",
        fontSize: normalize(17),
        fontWeight: "700",
    },
});
