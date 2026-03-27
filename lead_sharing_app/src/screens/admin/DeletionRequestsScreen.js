import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function DeletionRequestsScreen({ requests, onProcess, onDelete }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>
                Account Deletion Requests ({requests.length})
            </Text>

            {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="trash-2" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No pending requests</Text>
                </View>
            ) : (
                requests.map((request, index) => (
                    <View key={request._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{request.user?.name || "Unknown User"}</Text>
                                <Text style={styles.cardSubtitle}>{request.user?.email}</Text>
                                <View style={[styles.roleBadge, { marginTop: 4, alignSelf: 'flex-start', backgroundColor: request.user?.role === 'TRADESPERSON' ? '#2563EB' : '#10B981' }]}>
                                    <Text style={styles.roleBadgeText}>{request.user?.role}</Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            request.status === "APPROVED" ? "#DCFCE7" :
                                                request.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            request.status === "APPROVED" ? "#166534" :
                                                request.status === "REJECTED" ? "#991B1B" : "#854D0E",
                                    }
                                ]}>
                                    {request.status || "PENDING"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), backgroundColor: '#F8FAFC', padding: wp(3), borderRadius: wp(2) }}>
                            <Text style={styles.infoLabel}>Reason:</Text>
                            <Text style={[styles.cardSubtitle, { color: '#1E293B', marginTop: 2 }]}>
                                {request.reason || "No reason provided."}
                            </Text>
                        </View>

                        {request.status === "PENDING" && (
                            <View style={[styles.cardActions, { marginTop: hp(2) }]}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#DCFCE7', borderColor: '#DCFCE7' }]}
                                    onPress={() => onProcess(request._id, "APPROVED")}
                                >
                                    <Feather name="check-circle" size={14} color="#166534" style={styles.buttonIcon} />
                                    <Text style={[styles.actionButtonText, { color: '#166534' }]}>Approve & Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#FEE2E2', borderColor: '#FEE2E2' }]}
                                    onPress={() => onProcess(request._id, "REJECTED")}
                                >
                                    <Feather name="x-circle" size={14} color="#991B1B" style={styles.buttonIcon} />
                                    <Text style={[styles.actionButtonText, { color: '#991B1B' }]}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: hp(1) }]}>
                            <Text style={styles.verificationTime}>
                                Sent: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                            </Text>
                            <TouchableOpacity onPress={() => onDelete(request._id)}>
                                <Feather name="trash-2" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screenTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp(10),
    },
    emptyText: {
        fontSize: normalize(16),
        color: "#94A3B8",
        marginTop: hp(2),
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    cardSubtitle: {
        fontSize: normalize(14),
        color: "#64748B",
    },
    roleBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(3),
    },
    roleBadgeText: {
        fontSize: normalize(10),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
    },
    statusBadgeText: {
        fontSize: normalize(10),
        fontWeight: "700",
    },
    infoLabel: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(2),
        marginTop: hp(1.5),
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(2),
        backgroundColor: "#EFF6FF",
    },
    buttonIcon: {
        marginRight: 4,
    },
    actionButtonText: {
        fontSize: normalize(13),
        color: "#2563EB",
        fontWeight: "600",
    },
    verificationTime: {
        fontSize: normalize(12),
        color: "#94A3B8",
    },
});
