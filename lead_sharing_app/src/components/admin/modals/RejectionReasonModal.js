import React from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { normalize, wp, hp } from '../../../utils/responsive';

export default function RejectionReasonModal({ visible, reason, onReasonChange, onConfirm, onCancel }) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { maxHeight: hp(40) }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Rejection Reason</Text>
                    </View>
                    <View style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Please provide a reason for rejection:</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="e.g., ID document is expired or blurry"
                            value={reason}
                            onChangeText={onReasonChange}
                        />
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: "#EF4444" }]}
                            onPress={onConfirm}
                            disabled={!reason.trim()}
                        >
                            <Text style={styles.saveButtonText}>Confirm Reject</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: wp(5),
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1E293B",
    },
    modalBody: {
        padding: wp(5),
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(3),
        padding: wp(5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    inputLabel: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#475569",
        marginBottom: hp(1),
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        padding: wp(3),
        fontSize: normalize(16),
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
    },
    textArea: {
        minHeight: hp(12),
        textAlignVertical: "top",
    },
    cancelButton: {
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        backgroundColor: "#F1F5F9",
    },
    cancelButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#64748B",
    },
    saveButton: {
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        backgroundColor: "#2563EB",
    },
    saveButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
