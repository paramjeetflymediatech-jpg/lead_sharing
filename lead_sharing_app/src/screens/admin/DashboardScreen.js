import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { normalize, wp, hp } from '../../utils/responsive';
import StatCard from '../../components/admin/StatCard';

export default function DashboardScreen({ stats, onNavigate, deletionRequests }) {
    return (
        <>
            <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                    <StatCard
                        title="Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.totalHomeowners} HO • ${stats.totalTradespeople} TP`}
                        icon="users"
                        color="#2563EB"
                        onPress={() => onNavigate("Users")}
                    />
                    <StatCard
                        title="Jobs"
                        value={stats.totalJobs}
                        subtitle="Total posted"
                        icon="briefcase"
                        color="#10B981"
                        onPress={() => onNavigate("Jobs")}
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        title="Leads"
                        value={stats.totalLeads}
                        subtitle="Unlocked"
                        icon="file-text"
                        color="#F59E0B"
                        onPress={() => onNavigate("Leads")}
                    />
                    <StatCard
                        title="Revenue"
                        value={`$${stats.revenue}`}
                        subtitle="Platform"
                        icon="dollar-sign"
                        color="#8B5CF6"
                        onPress={() => onNavigate("Revenue")}
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        title="Deletion"
                        value={deletionRequests.length}
                        subtitle="Pending Requests"
                        icon="trash-2"
                        color="#EF4444"
                        onPress={() => onNavigate("DeletionRequests")}
                    />
                    <View style={{ flex: 1 }} />
                </View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Platform Overview</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Homeowners</Text>
                    <Text style={styles.summaryValue}>{stats.totalHomeowners}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tradespeople</Text>
                    <Text style={styles.summaryValue}>{stats.totalTradespeople}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Active Jobs</Text>
                    <Text style={styles.summaryValue}>{stats.totalJobs}</Text>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    statsGrid: {
        marginBottom: hp(2.5),
    },
    statsRow: {
        flexDirection: "row",
        gap: wp(3),
        marginBottom: hp(1.5),
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp(1.5),
    },
    summaryLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "#E2E8F0",
    },
});
