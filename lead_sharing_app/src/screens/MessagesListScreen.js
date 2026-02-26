import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { homeownerAPI, tradespersonAPI } from "../services/api";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";
import { normalize, wp, hp } from "../utils/responsive";
import MessagesModal from "./MessagesModal";

export default function MessagesListScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchConversations = async () => {
        try {
            let data;
            if (user.role === "HOMEOWNER") {
                data = await homeownerAPI.getMessages();
            } else {
                data = await tradespersonAPI.getConversations();
            }

            if (data.success && data.conversations) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations();

            // Check for conversationId in route params
            if (route.params?.conversationId && conversations.length > 0) {
                const conv = conversations.find(c => c.id === route.params.conversationId);
                if (conv) {
                    openConversation(conv);
                    // Clear the param so it doesn't re-open
                    navigation.setParams({ conversationId: null });
                }
            }
        }, [route.params?.conversationId, conversations.length])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const openConversation = (conv) => {
        setSelectedConversation(conv);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedConversation(null);
        fetchConversations(); // Refresh list on close
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderItem = ({ item }) => {
        // Determine name/image based on role
        const name = user.role === "HOMEOWNER" ? item.tradespersonName : item.homeownerName;
        const image = user.role === "HOMEOWNER" ? item.tradespersonProfileImage : item.homeownerProfileImage;

        // For tradesperson, the dashboard uses 'homeownerId' in conversation object
        // For homeowner, the dashboard uses 'tradespersonId'
        // But data implementation seems consistent: id = `${jobId}-${otherUserId}`

        // NOTE: The `MessagesModal` expects `jobId` and `homeownerId`.
        // If I am a tradesperson, I need `item.homeownerId`.
        // If I am a homeowner, I am chatting WITH a tradesperson. The modal currently is designed
        // for Tradesperson -> Homeowner chat. I might need to update modal or use logic here.
        //
        // Let's check `MessagesModal.js` implementation...
        // It uses `tradespersonAPI.getConversation` and `sendMessage`.
        // Wait! `MessagesModal` imports `tradespersonAPI`.
        // Does it work for homeowners?

        // Ah, `MessagesModal` is hardcoded to use `tradespersonAPI`!
        // I need to update `MessagesModal` to support both roles or pass the role in.

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => openConversation(item)}
            >
                <View style={styles.avatarContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>{name?.charAt(0).toUpperCase() || "?"}</Text>
                        </View>
                    )}
                    {item.unreadCount > 0 && <View style={styles.unreadBadge} />}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name} numberOfLines={1}>{name || "User"}</Text>
                        <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
                    </View>

                    <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>

                    <View style={styles.messageRow}>
                        <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={1}>
                            {item.lastMessage || "No messages yet"}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
            </View>

            {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="message-square" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No messages yet</Text>
                    <Text style={styles.emptyText}>
                        {user.role === "TRADESPERSON"
                            ? "Start bidding on jobs to begin conversations."
                            : "Post a job and hire a tradesperson to start chatting."}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}

            {selectedConversation && (
                <MessagesModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    jobId={selectedConversation.jobId}
                    homeownerId={selectedConversation.homeownerId || selectedConversation.tradespersonId} // This needs care
                    jobTitle={selectedConversation.jobTitle}
                // We might need to pass role or API instance to modal if it's not generic
                />
            )}
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
    },
    header: {
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
        paddingBottom: hp(2),
        paddingHorizontal: wp(5),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        marginRight: wp(4),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1F2937",
    },
    listContent: {
        padding: 16,
    },
    conversationItem: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#E5E7EB",
    },
    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DBEAFE",
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2563EB",
    },
    unreadBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#EF4444",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    jobTitle: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 6,
        fontWeight: "500",
    },
    messageRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    lastMessage: {
        fontSize: 14,
        color: "#6B7280",
        flex: 1,
        marginRight: 8,
    },
    unreadMessage: {
        color: "#1F2937",
        fontWeight: "500",
    },
    countBadge: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
});
