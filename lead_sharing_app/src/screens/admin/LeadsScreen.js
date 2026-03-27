import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function LeadsScreen({ leads, status, onStatusChange, onEdit, onDelete }) {
    const statuses = [
        { label: "All", value: "ALL" },
        { label: "Pending", value: "PENDING" },
        { label: "Hired", value: "HIRED" },
        { label: "Rejected", value: "REJECTED" }
    ];

    const filteredLeads = status === "ALL"
        ? leads
        : leads.filter(l => l.status === status);

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

            <Text style={styles.screenTitle}>
                {status === "ALL" ? "Total Leads" : `${status} Leads`}: {filteredLeads.length}
            </Text>

            {filteredLeads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="file-text" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No leads found</Text>
                </View>
            ) : (
                filteredLeads.map((lead, index) => (
                    <View key={lead._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>
                                    {lead.tradesperson?.user?.name || "Unknown Tradesperson"}
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    {lead.tradesperson?.companyName || "No Company"}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            lead.status === "HIRED" ? "#DCFCE7" :
                                                lead.status === "REJECTED" ? "#FEE2E2" : "#EFF6FF",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            lead.status === "HIRED" ? "#166534" :
                                                lead.status === "REJECTED" ? "#991B1B" : "#1E40AF",
                                    }
                                ]}>
                                    {lead.status || "PENDING"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), backgroundColor: '#F8FAFC', padding: wp(3), borderRadius: wp(2) }}>
                            <Text style={[styles.cardSubtitle, { fontStyle: 'italic' }]} numberOfLines={3}>
                                "{lead.message || "No message provided."}"
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp(1.5) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="dollar-sign" size={14} color="#2563EB" />
                                <Text style={{ fontSize: normalize(16), fontWeight: '700', color: '#1E293B' }}>
                                    {lead.priceEstimate ? `£${lead.priceEstimate}` : "N/A"}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather
                                    name={lead.isUnlocked ? "unlock" : "lock"}
                                    size={14}
                                    color={lead.isUnlocked ? "#10B981" : "#F59E0B"}
                                />
                                <Text style={{
                                    fontSize: normalize(12),
                                    fontWeight: '600',
                                    color: lead.isUnlocked ? "#10B981" : "#F59E0B",
                                    marginLeft: 4
                                }}>
                                    {lead.isUnlocked ? "Unlocked" : "Locked"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: normalize(12), color: '#94A3B8' }} numberOfLines={1}>
                                    Job: {lead.job?.description || "Deleted Job"}
                                </Text>
                                <Text style={styles.verificationTime}>
                                    Applied: {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(lead)}>
                                    <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(lead._id)}>
                                    <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
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
        fontSize: normalize(16),
        color: "#64748B",
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
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(2),
        marginTop: hp(1.5),
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    verificationTime: {
        fontSize: normalize(12),
        color: "#94A3B8",
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
    deleteButton: {
        backgroundColor: "#FEE2E2",
    },
    deleteButtonText: {
        fontSize: normalize(13),
        color: "#EF4444",
        fontWeight: "600",
    },
});
