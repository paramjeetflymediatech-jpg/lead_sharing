import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { tradespersonAPI, userAPI } from "../services/api";

export default function MessagesModal({ visible, onClose, jobId, homeownerId, jobTitle }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const flatListRef = useRef(null);

    // Polling interval ref to clear on unmount
    const pollingInterval = useRef(null);

    useEffect(() => {
        if (visible && jobId && homeownerId) {
            loadMyUser();
            // Start polling (will be called after user is loaded in verify logic, 
            // but we can start it here safely if we handle missing role check)
            // Actually, better to wait for role to be set.
        } else {
            // Clear polling when modal closes
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
            }
        }

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [visible, jobId, homeownerId]);

    // Effect to start loading messages once role is known
    useEffect(() => {
        if (userRole && visible) {
            loadMessages();
            pollingInterval.current = setInterval(loadMessages, 5000);
        }
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        }
    }, [userRole, visible, jobId, homeownerId]);


    const loadMyUser = async () => {
        try {
            const data = await userAPI.getMe();
            if (data.success && data.user) {
                setMyUserId(data.user._id);
                setUserRole(data.user.role);
            }
        } catch (error) {
            console.error("Error loading user:", error);
        }
    };

    const loadMessages = async () => {
        if (!jobId || !homeownerId || !userRole) return;

        try {
            const conversationId = `${jobId}-${homeownerId}`;
            let data;

            if (userRole === 'HOMEOWNER') {
                // For homeowner, we might use a different API or the same structure
                // Homeowner API: getConversation(conversationId)
                // NOTE: conversationId format must match backend expectation
                data = await import("../services/api").then(module => module.homeownerAPI.getConversation(conversationId));
            } else {
                data = await tradespersonAPI.getConversation(conversationId);
            }

            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !jobId || !homeownerId || !userRole) return;

        try {
            setSending(true);
            const conversationId = `${jobId}-${homeownerId}`;
            let response;

            if (userRole === 'HOMEOWNER') {
                response = await import("../services/api").then(module => module.homeownerAPI.sendMessage(conversationId, newMessage.trim()));
            } else {
                response = await tradespersonAPI.sendMessage(conversationId, newMessage.trim());
            }

            if (response.success) {
                setNewMessage("");
                loadMessages(); // Refresh immediately
                // Optional: Scroll to bottom
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } else {
                Alert.alert("Error", response.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.isMine || (myUserId && item.senderId === myUserId);

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {item.content}
                </Text>
                <Text style={[
                    styles.messageTime,
                    isMe ? styles.myMessageTime : styles.theirMessageTime
                ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Messages</Text>
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                {jobTitle || "Job Discussion"}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Messages List or Empty State */}
                    {loading && messages.length === 0 ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color="#2563EB" />
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyTitle}>Start the conversation</Text>
                            <Text style={styles.emptyText}>
                                Introduce yourself and discuss the job details with the homeowner.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.messagesList}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        />
                    )}

                    {/* Input Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                    >
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type a message..."
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!newMessage.trim() || sending) && styles.sendButtonDisabled
                                ]}
                                onPress={handleSendMessage}
                                disabled={!newMessage.trim() || sending}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.sendButtonText}>Send</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#F3F4F6",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#6B7280",
        maxWidth: 250,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    closeText: {
        fontSize: 18,
        color: "#6B7280",
        fontWeight: "600",
    },
    messagesList: {
        padding: 16,
        gap: 12,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: "80%",
        borderRadius: 16,
        padding: 12,
        marginBottom: 4,
    },
    myMessage: {
        backgroundColor: "#2563EB",
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        backgroundColor: "#FFFFFF",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: {
        color: "#FFFFFF",
    },
    theirMessageText: {
        color: "#1F2937",
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
    },
    myMessageTime: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    theirMessageTime: {
        color: "#9CA3AF",
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        alignItems: "flex-end",
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sendButton: {
        backgroundColor: "#2563EB",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
    sendButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },
});
