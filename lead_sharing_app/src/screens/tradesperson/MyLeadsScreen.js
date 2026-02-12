import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Platform,
} from "react-native";
import { tradespersonAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";

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
                <Text style={styles.headerSubtitle}>
                    {leads.length} {leads.length === 1 ? 'lead' : 'leads'} unlocked
                </Text>
            </View>

            <FlatList
                data={leads}
                keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => <LeadCard lead={item} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Feather name="inbox" size={40} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyTitle}>No leads yet</Text>
                        <Text style={styles.emptyText}>
                            Unlock jobs to view contact details and start growing your business.
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

function LeadCard({ lead }) {
    const getStatusInfo = (status) => {
        switch (status) {
            case "PENDING": return { color: "#F59E0B", icon: "clock", bg: "#FEF3C7", label: "Pending" };
            case "ACCEPTED": return { color: "#10B981", icon: "check-circle", bg: "#D1FAE5", label: "Accepted" };
            case "REJECTED": return { color: "#EF4444", icon: "x-circle", bg: "#FEE2E2", label: "Rejected" };
            default: return { color: "#6B7280", icon: "help-circle", bg: "#F3F4F6", label: status };
        }
    };

    const statusInfo = getStatusInfo(lead.status);

    const handleCall = () => {
        if (lead.homeowner_phone) {
            Linking.openURL(`tel:${lead.homeowner_phone}`);
        }
    };

    const handleEmail = () => {
        if (lead.homeowner_email) {
            Linking.openURL(`mailto:${lead.homeowner_email}`);
        }
    };

    return (
        <View style={styles.leadCard}>
            {/* Header: Description & Status */}
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.leadTitle} numberOfLines={1}>
                        {lead.job_description || "Job Description"}
                    </Text>
                    <View style={styles.dateContainer}>
                        <Feather name="calendar" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
                        <Text style={styles.dateText}>
                            {lead.unlocked_at ? new Date(lead.unlocked_at).toLocaleDateString() : 'Unknown date'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Feather name={statusInfo.icon} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
            </View>

            {/* Details: Location & Budget */}
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Feather name="map-pin" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                    <Text style={styles.detailText}>{lead.postcode || "Unknown Location"}</Text>
                </View>
                {lead.budget_max && (
                    <View style={[styles.detailItem, { marginLeft: 16 }]}>
                        <Text style={styles.currencySymbol}>£</Text>
                        <Text style={styles.detailText}>
                            {lead.budget_min || 0} - {lead.budget_max}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {/* Contact Section */}
            <View style={styles.contactSection}>
                <View style={styles.homeownerInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {lead.homeowner_name ? lead.homeowner_name.charAt(0).toUpperCase() : "H"}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.homeownerName}>
                            {lead.homeowner_name || "Homeowner"}
                        </Text>
                        <Text style={styles.homeownerLabel}>Contact details unlocked</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {lead.homeowner_phone && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.callButton]}
                            onPress={handleCall}
                        >
                            <Feather name="phone" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                    )}

                    {lead.homeowner_email && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.emailButton]}
                            onPress={handleEmail}
                        >
                            <Feather name="mail" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                            <Text style={[styles.actionButtonText, { color: '#4B5563' }]}>Email</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    listContent: {
        padding: 16,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },
    leadCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    leadTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
    },
    detailsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "500",
    },
    currencySymbol: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "600",
        marginRight: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginHorizontal: -16,
        marginBottom: 16,
    },
    contactSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    homeownerInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    avatarText: {
        color: "#2563EB",
        fontSize: 14,
        fontWeight: "700",
    },
    homeownerName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    homeownerLabel: {
        fontSize: 12,
        color: "#6B7280",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    callButton: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    emailButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
