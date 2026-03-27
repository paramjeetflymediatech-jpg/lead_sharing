import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';
import { API_BASE_URL } from '../../config/api';

export default function UsersScreen({ users, searchQuery, onSearchChange, onEdit, onDelete }) {
    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#94A3B8" style={styles.searchIconStyle} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            <Text style={styles.screenTitle}>
                Total Users: {filteredUsers.length}
            </Text>

            {filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="users" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No users found</Text>
                </View>
            ) : (
                filteredUsers.map((user, index) => (
                    <View key={user._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.userAvatar}>
                                {user.profileImage || user.profile_image ? (
                                    <Image
                                        source={{
                                            uri: (user.profileImage || user.profile_image).startsWith('http')
                                                ? (user.profileImage || user.profile_image)
                                                : `${API_BASE_URL}${user.profileImage || user.profile_image}`
                                        }}
                                        style={styles.userAvatarImage}
                                    />
                                ) : (
                                    <Text style={styles.userAvatarText}>
                                        {user.name?.charAt(0) || "U"}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{user.name || "Unknown"}</Text>
                                <Text style={styles.cardSubtitle}>{user.email}</Text>
                            </View>
                            <View
                                style={[
                                    styles.roleBadge,
                                    {
                                        backgroundColor:
                                            user.role === "ADMIN"
                                                ? "#EF4444"
                                                : user.role === "TRADESPERSON"
                                                    ? "#2563EB"
                                                    : "#10B981",
                                    },
                                ]}
                            >
                                <Text style={styles.roleBadgeText}>{user.role}</Text>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onEdit(user)}
                            >
                                <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(user)}
                            >
                                <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIconStyle: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(16),
        color: "#1E293B",
    },
    screenTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: hp(8),
    },
    emptyIconStyle: {
        marginBottom: hp(2),
    },
    emptyText: {
        fontSize: normalize(16),
        color: "#94A3B8",
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
    userAvatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    userAvatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: wp(6),
    },
    userAvatarText: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
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
    deleteButton: {
        backgroundColor: "#FEE2E2",
    },
    deleteButtonText: {
        fontSize: normalize(13),
        color: "#EF4444",
        fontWeight: "600",
    },
});
