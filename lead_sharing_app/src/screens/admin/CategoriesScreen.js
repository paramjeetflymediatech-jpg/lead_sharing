import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function CategoriesScreen({ categories, onEdit, onDelete }) {
    return (
        <>
            <Text style={styles.screenTitle}>
                Total Categories: {categories.length}
            </Text>

            {categories.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="layers" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No categories found</Text>
                </View>
            ) : (
                categories.map((category, index) => (
                    <View key={category._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="layers" size={24} color="#64748B" style={styles.categoryIconStyles} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{category.name}</Text>
                                {category.description && (
                                    <Text style={styles.cardSubtitle}>
                                        {category.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onEdit(category)}
                            >
                                <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(category)}
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
    categoryIconStyles: {
        marginRight: 4,
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
