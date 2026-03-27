import React from 'react';
import { View, Text, TextInput, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { normalize, wp, hp } from '../../../utils/responsive';

export default function LeadFormModal({ visible, editing, formData, jobs, users, onFormChange, onSave, onClose }) {
    const tradespeople = users.filter(u => u.role === "TRADESPERSON");

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit Lead" : "Create Lead"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Job *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.job}
                                onValueChange={(value) => onFormChange({ ...formData, job: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Job" value="" />
                                {jobs.map((j) => (
                                    <Picker.Item key={j._id} label={j.description} value={j._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Tradesperson *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.tradesperson}
                                onValueChange={(value) => onFormChange({ ...formData, tradesperson: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Tradesperson" value="" />
                                {tradespeople.map((u) => (
                                    <Picker.Item key={u._id} label={u.name} value={u.tradesperson_profile_id || u._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter quote message"
                            value={formData.message}
                            onChangeText={(text) => onFormChange({ ...formData, message: text })}
                            multiline
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Price Estimate (£)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter estimate"
                            value={formData.priceEstimate}
                            onChangeText={(text) => onFormChange({ ...formData, priceEstimate: text })}
                            keyboardType="numeric"
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(value) => onFormChange({ ...formData, status: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Pending" value="PENDING" />
                                <Picker.Item label="Hired" value="HIRED" />
                                <Picker.Item label="Rejected" value="REJECTED" />
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2) }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => onFormChange({ ...formData, isUnlocked: !formData.isUnlocked })}
                            >
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderWidth: 1,
                                    borderColor: '#2563EB',
                                    borderRadius: 4,
                                    backgroundColor: formData.isUnlocked ? '#2563EB' : 'transparent',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8
                                }}>
                                    {formData.isUnlocked && <Feather name="check" size={14} color="#FFFFFF" />}
                                </View>
                                <Text style={{ fontSize: normalize(14), color: '#1E293B' }}>Is Unlocked</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
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
        maxHeight: hp(50),
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
        marginTop: hp(1.5),
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    picker: {
        height: hp(6),
        color: "#1E293B",
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
