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
import { normalize } from "../../utils/responsive";

export default function MyLeadsScreen({ navigation }) {
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

            let leadsList = [];
            if (data?.data?.leads) {
                leadsList = data.data.leads;
            } else if (Array.isArray(data?.data)) {
                leadsList = data.data;
            } else if (Array.isArray(data?.leads)) {
                leadsList = data.leads;
            } else if (Array.isArray(data)) {
                leadsList = data;
            }

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
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>My Leads</Text>
                <Text style={styles.headerSubtitle}>
                    {leads.length} {leads.length === 1 ? 'lead' : 'leads'} unlocked
                </Text>
            </View> */}

            <FlatList
                data={leads}
                keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => <LeadCard lead={item} navigation={navigation} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Feather name="inbox" size={normalize(40)} color="#9CA3AF" />
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

function LeadCard({ lead, navigation }) {
    const getStatusInfo = (status) => {
        switch (status) {
            case "PENDING": return { color: "#F59E0B", icon: "clock", bg: "#FEF3C7", label: "Pending" };
            case "ACCEPTED": return { color: "#10B981", icon: "check-circle", bg: "#ECFDF5", label: "Accepted" };
            case "REJECTED": return { color: "#EF4444", icon: "x-circle", bg: "#FEF2F2", label: "Rejected" };
            case "ACTIVE": return { color: "#2563EB", icon: "unlock", bg: "#EFF6FF", label: "Unlocked" };
            default: return { color: "#6B7280", icon: "help-circle", bg: "#F3F4F6", label: status || "Unlocked" };
        }
    };

    const statusInfo = getStatusInfo(lead.status || "ACTIVE");

    const job = lead.job || {};

    // The backend provides contact details in job info or lead object
    const contactName = lead.homeowner_name || job.homeowner?.name || "Homeowner";
    const contactEmail = lead.homeowner_email || job.homeowner?.email;
    const contactPhone = lead.homeowner_phone || job.homeowner?.phone;

    return (
        <View style={styles.leadCard}>
            {/* Header: Description & Status */}
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.leadTitle} numberOfLines={1}>
                        {job.title || job.description || lead.job_description || "Job Request"}
                    </Text>
                    <View style={styles.dateContainer}>
                        <Feather name="calendar" size={normalize(12)} color="#9CA3AF" style={{ marginRight: 4 }} />
                        <Text style={styles.dateText}>
                            {lead.unlockedAt ? new Date(lead.unlockedAt).toLocaleDateString() :
                                lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recently'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Feather name={statusInfo.icon} size={normalize(11)} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
            </View>

            {/* Details: Location & Budget */}
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <View style={styles.iconCircle}>
                        <Feather name="map-pin" size={normalize(12)} color="#6B7280" />
                    </View>
                    <Text style={styles.detailText}>{job.location || job.postcode || lead.postcode || "Location provided"}</Text>
                </View>
                {(job.budget_max || lead.budget_max) && (
                    <View style={[styles.detailItem, { marginLeft: 16 }]}>
                        <View style={styles.iconCircle}>
                            <Feather name="dollar-sign" size={normalize(12)} color="#6B7280" />
                        </View>
                        <Text style={styles.detailText}>
                            {job.budget_min || lead.budget_min || 0} - {job.budget_max || lead.budget_max}
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
                            {contactName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.homeownerName} numberOfLines={1}>
                            {contactName}
                        </Text>
                        <Text style={styles.homeownerLabel}>Contact Unlocked</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {contactPhone && contactPhone !== 'Not provided' && (
                        <TouchableOpacity
                            style={[styles.smallActionButton, styles.callButton]}
                            onPress={() => Linking.openURL(`tel:${contactPhone}`)}
                        >
                            <Feather name="phone" size={normalize(16)} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    {contactEmail && contactEmail !== 'Not provided' && (
                        <TouchableOpacity
                            style={[styles.smallActionButton, styles.emailButton]}
                            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
                        >
                            <Feather name="mail" size={normalize(16)} color="#4B5563" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.smallActionButton, styles.viewDetailsButton]}
                        onPress={() => navigation.navigate('JobDetails', { jobId: lead.jobId || job.id })}
                    >
                        <Feather name="eye" size={normalize(16)} color="#2563EB" />
                    </TouchableOpacity>
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
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 21,
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
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "500",
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
        gap: 12,
    },
    homeownerInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    avatarText: {
        color: "#2563EB",
        fontSize: 16,
        fontWeight: "700",
    },
    homeownerName: {
        fontSize: 15,
        fontWeight: "700",
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
    smallActionButton: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },
    callButton: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    emailButton: {
        backgroundColor: "#F9FAFB",
        borderColor: "#E5E7EB",
    },
    viewDetailsButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#2563EB",
    },
});
