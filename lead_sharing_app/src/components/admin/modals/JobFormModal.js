import React from 'react';
import { View, Text, TextInput, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { normalize, wp, hp } from '../../../utils/responsive';

export default function JobFormModal({ visible, editing, formData, users, categories, subcategories, onFormChange, onSave, onClose }) {
    const homeowners = users.filter(u => u.role === "HOMEOWNER");
    const filteredSubcategories = subcategories.filter(s => String(s.category?._id || s.category) === String(formData.category));

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
                            {editing ? "Edit Job" : "Create Job"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter job description"
                            value={formData.description}
                            onChangeText={(text) => onFormChange({ ...formData, description: text })}
                            multiline
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Homeowner *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.homeowner}
                                onValueChange={(value) => onFormChange({ ...formData, homeowner: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Homeowner" value="" />
                                {homeowners.map((u) => (
                                    <Picker.Item key={u._id} label={`${u.name} (${u.email})`} value={u._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Category *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.category}
                                onValueChange={(value) => onFormChange({ ...formData, category: value, subCategory: "" })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((c) => (
                                    <Picker.Item key={c._id} label={c.name} value={c._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Subcategory *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.subCategory}
                                onValueChange={(value) => onFormChange({ ...formData, subCategory: value })}
                                style={styles.picker}
                                disabled={!formData.category}
                            >
                                <Picker.Item label="Select Subcategory" value="" />
                                {filteredSubcategories.map((s) => (
                                    <Picker.Item key={s._id} label={s.name} value={s._id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', gap: wp(3) }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    value={formData.city}
                                    onChangeText={(text) => onFormChange({ ...formData, city: text })}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Postcode</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Postcode"
                                    value={formData.postcode}
                                    onChangeText={(text) => onFormChange({ ...formData, postcode: text })}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: wp(3) }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Min Budget (£)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min"
                                    value={formData.budgetMin}
                                    onChangeText={(text) => onFormChange({ ...formData, budgetMin: text })}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Max Budget (£)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Max"
                                    value={formData.budgetMax}
                                    onChangeText={(text) => onFormChange({ ...formData, budgetMax: text })}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(value) => onFormChange({ ...formData, status: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Open" value="OPEN" />
                                <Picker.Item label="In Progress" value="IN_PROGRESS" />
                                <Picker.Item label="Completed" value="COMPLETED" />
                                <Picker.Item label="Cancelled" value="CANCELLED" />
                            </Picker>
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
