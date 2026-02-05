import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { tradespersonAPI } from "../../services/api";

export default function MyLeadsScreen() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadLeads();
    }, []);

    async function loadLeads() {
        try {
            setLoading(true);
            const data = await tradespersonAPI.getMyLeads();
            const leadsList = Array.isArray(data) ? data : data?.leads || [];
            setLeads(leadsList);
        } catch (error) {
            console.error("Error loading leads:", error);
        } finally {
            setLoading(false);
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadLeads();
        setRefreshing(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Leads</Text>
                <Text style={styles.headerSubtitle}>{leads.length} unlocked leads</Text>
            </View>

            <FlatList
                data={leads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LeadCard lead={item} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No leads yet</Text>
                        <Text style={styles.emptyText}>
                            Unlock jobs to view contact details and submit quotes
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

function LeadCard({ lead }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "#F59E0B";
            case "ACCEPTED": return "#10B981";
            case "REJECTED": return "#EF4444";
            default: return "#6B7280";
        }
    };

    return (
        <View style={styles.leadCard}>
            <View style={styles.leadHeader}>
                <Text style={styles.leadTitle} numberOfLines={2}>
                    {lead.job_description || "Job"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
                    <Text style={styles.statusText}>
                        {lead.status || "PENDING"}
                    </Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{lead.postcode || "N/A"}</Text>
                </View>
                {lead.budget_max && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>💰</Text>
                        <Text style={styles.detailText}>
                            £{lead.budget_min || 0} - £{lead.budget_max}
                        </Text>
                    </View>
                )}
            </View>

            {lead.homeowner_name && (
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Contact Details</Text>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactIcon}>👤</Text>
                        <Text style={styles.contactText}>{lead.homeowner_name}</Text>
                    </View>
                    {lead.homeowner_phone && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactIcon}>📞</Text>
                            <Text style={styles.contactText}>{lead.homeowner_phone}</Text>
                        </View>
                    )}
                    {lead.homeowner_email && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactIcon}>📧</Text>
                            <Text style={styles.contactText}>{lead.homeowner_email}</Text>
                        </View>
                    )}
                </View>
            )}

            {lead.unlocked_at && (
                <Text style={styles.unlockDate}>
                    Unlocked {new Date(lead.unlocked_at).toLocaleDateString()}
                </Text>
            )}
        </View>
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
    header: {
        padding: 20,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 48,
        alignItems: "center",
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    leadCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    leadHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    leadTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    detailsGrid: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    detailText: {
        fontSize: 14,
        color: "#6B7280",
    },
    contactSection: {
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    contactIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    contactText: {
        fontSize: 14,
        color: "#4B5563",
    },
    unlockDate: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
    },
});
