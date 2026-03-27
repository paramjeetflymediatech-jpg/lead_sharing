import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { normalize, wp, hp } from '../../../utils/responsive';
import { Feather } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../config/api';

export default function VerificationDetailsModal({ visible, tradesperson, onApprove, onReject, onClose }) {
    if (!tradesperson) return null;

    const handleOpenDocument = async (path) => {
        if (!path) return;
        const formattedPath = path.startsWith('http') ? path : (path.startsWith('/') ? path : `/${path}`);
        const url = path.startsWith('http') ? path : `${API_BASE_URL}${formattedPath}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Don't know how to open this URL: " + url);
            }
        } catch (error) {
            Alert.alert("Error", "Could not open document");
            console.error(error);
        }
    };

    const renderDocument = (label, path) => (
        <View style={{ marginBottom: 12 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            {path ? (
                <TouchableOpacity
                    style={styles.documentLink}
                    onPress={() => handleOpenDocument(path)}
                >
                    <Feather name="file-text" size={20} color="#2563EB" style={styles.documentIcon} />
                    <Text style={styles.documentText} numberOfLines={1}>{path.split('/').pop()}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.noDocument}>Not provided</Text>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Review Application</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalClose}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Tradesperson Name</Text>
                            <Text style={styles.detailValue}>{tradesperson.name}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Company Name</Text>
                            <Text style={styles.detailValue}>{tradesperson.company_name}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{tradesperson.email}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{tradesperson.phone || "N/A"} {tradesperson.phone_verified ? "(Verified)" : "(Unverified)"}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Documents</Text>
                            {renderDocument("Government ID", tradesperson.id_document)}
                            {renderDocument("Insurance Certificate", tradesperson.insurance_document)}
                            {renderDocument("Trade License", tradesperson.license_document)}
                        </View>

                        {tradesperson.verification_status === "REJECTED" && tradesperson.rejection_reason && (
                            <View style={[styles.detailSection, { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8 }]}>
                                <Text style={[styles.detailLabel, { color: "#991B1B" }]}>Previous Rejection Reason</Text>
                                <Text style={{ color: "#991B1B" }}>{tradesperson.rejection_reason}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {tradesperson.verification_status === "PENDING_APPROVAL" && (
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
                                <Text style={styles.approveButtonText}>Approve Account</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: wp(5),
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1E293B",
    },
    modalClose: {
        fontSize: normalize(28),
        color: "#64748B",
        fontWeight: "300",
    },
    modalBody: {
        padding: wp(5),
        maxHeight: hp(50),
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(3),
        padding: wp(5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    detailSection: {
        marginBottom: hp(2.5),
    },
    detailLabel: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#64748B",
        marginBottom: hp(0.8),
    },
    detailValue: {
        fontSize: normalize(16),
        color: "#1E293B",
    },
    documentLink: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: hp(1),
    },
    documentIcon: {
        marginRight: wp(3),
    },
    documentText: {
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "500",
        flex: 1,
    },
    noDocument: {
        fontSize: normalize(14),
        color: "#94A3B8",
        fontStyle: "italic",
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#FEE2E2",
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: "center",
    },
    rejectButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#EF4444",
    },
    approveButton: {
        flex: 2,
        backgroundColor: "#10B981",
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: "center",
    },
    approveButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
