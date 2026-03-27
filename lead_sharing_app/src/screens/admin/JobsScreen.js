import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function JobsScreen({ jobs, status, onStatusChange, onEdit, onDelete }) {
    const statuses = [
        { label: "All", value: "ALL" },
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" }
    ];

    const filteredJobs = status === "ALL"
        ? jobs
        : jobs.filter(j => j.status === status);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.statusFilterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {statuses.map((s) => (
                        <TouchableOpacity
                            key={s.value}
                            style={[
                                styles.statusFilterItem,
                                status === s.value && styles.statusFilterItemActive,
                                { paddingHorizontal: wp(4), marginRight: wp(2) }
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
                </ScrollView>
            </View>

            <Text style={styles.screenTitle}>
                {status === "ALL" ? "Total Jobs" : `${status.replace('_', ' ')} Jobs`}: {filteredJobs.length}
            </Text>

            {filteredJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="briefcase" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No jobs found</Text>
                </View>
            ) : (
                filteredJobs.map((job, index) => (
                    <View key={job._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{job.description || "No Description"}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(0.5) }}>
                                    <Feather name="tag" size={12} color="#64748B" />
                                    <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                        {job.category?.name || "Uncategorized"} {job.subCategory?.name ? `> ${job.subCategory.name}` : ""}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            job.status === "COMPLETED" ? "#DCFCE7" :
                                                job.status === "IN_PROGRESS" ? "#FEF3C7" :
                                                    job.status === "CANCELLED" ? "#FEE2E2" : "#EFF6FF",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            job.status === "COMPLETED" ? "#166534" :
                                                job.status === "IN_PROGRESS" ? "#854D0E" :
                                                    job.status === "CANCELLED" ? "#991B1B" : "#1E40AF",
                                    }
                                ]}>
                                    {job.status || "OPEN"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), gap: hp(0.5) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="map-pin" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>{job.location?.city || job.city || "Location N/A"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="dollar-sign" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                    {job.budgetMin ? `£${job.budgetMin}` : "0"} - {job.budgetMax ? `£${job.budgetMax}` : "Any"}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="user" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                    {job.homeowner?.name || "Unknown Homeowner"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center' }]}>
                            <Text style={styles.verificationTime}>
                                Added: {job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(job)}>
                                    <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(job._id)}>
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
        fontSize: normalize(12),
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
