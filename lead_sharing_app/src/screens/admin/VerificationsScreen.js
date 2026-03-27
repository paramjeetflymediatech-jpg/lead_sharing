import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function VerificationsScreen({ verifications, status, onStatusChange, onReview }) {
    const statuses = [
        { label: "Pending", value: "PENDING_APPROVAL" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" }
    ];

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.statusFilterContainer}>
                {statuses.map((s) => (
                    <TouchableOpacity
                        key={s.value}
                        style={[
                            styles.statusFilterItem,
                            status === s.value && styles.statusFilterItemActive
                        ]}
                        onPress={() => onStatusChange(s.value)}
                    >
                        <Text style={[
                            styles.statusFilterText,
                            status === s.value && styles.statusFilterTextActive
                        ]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {verifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="shield" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No applications found</Text>
                </View>
            ) : (
                verifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.verificationCard}
                        onPress={() => onReview(item)}
                    >
                        <View style={styles.verificationHeader}>
                            <View style={styles.verificationInfo}>
                                <Text style={styles.verificationName}>{item.name}</Text>
                                <Text style={styles.verificationCompany}>{item.company_name}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        item.verification_status === "APPROVED" ? "#DCFCE7" :
                                            item.verification_status === "REJECTED" ? "#FEE2E2" : "#FEF3C7"
                                }
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            item.verification_status === "APPROVED" ? "#166534" :
                                                item.verification_status === "REJECTED" ? "#991B1B" : "#854D0E"
                                    }
                                ]}>
                                    {item.verification_status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.verificationFooter}>
                            <Text style={styles.verificationTime}>
                                Submitted: {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                            <View style={styles.reviewButton}>
                                <Text style={styles.reviewButtonText}>Review</Text>
                                <Feather name="chevron-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    statusFilterContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: wp(2),
        padding: wp(1),
        marginBottom: hp(2),
    },
    statusFilterItem: {
        flex: 1,
        paddingVertical: hp(1),
        alignItems: "center",
        borderRadius: wp(1.5),
    },
    statusFilterItemActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statusFilterText: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#64748B",
    },
    statusFilterTextActive: {
        color: "#2563EB",
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
    verificationCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    verificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: hp(1.5),
    },
    verificationInfo: {
        flex: 1,
    },
    verificationName: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1E293B",
    },
    verificationCompany: {
        fontSize: normalize(14),
        color: "#64748B",
        marginTop: hp(0.2),
    },
    statusBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.5),
        borderRadius: wp(1),
    },
    statusBadgeText: {
        fontSize: normalize(11),
        fontWeight: "700",
    },
    verificationFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: hp(1),
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    verificationTime: {
        fontSize: normalize(12),
        color: "#94A3B8",
    },
    reviewButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563EB",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(1.5),
    },
    reviewButtonText: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
