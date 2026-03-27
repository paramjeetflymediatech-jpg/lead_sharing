import React from 'react';
import { View, Text, TextInput, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { normalize, wp, hp } from '../../../utils/responsive';

export default function UserFormModal({ visible, editing, formData, onFormChange, onSave, onClose }) {
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
                            {editing ? "Edit User" : "Create User"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter name"
                            value={formData.name}
                            onChangeText={(text) => onFormChange({ ...formData, name: text })}
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={formData.email}
                            onChangeText={(text) => onFormChange({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Role *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.role}
                                onValueChange={(value) => onFormChange({ ...formData, role: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Homeowner" value="HOMEOWNER" />
                                <Picker.Item label="Tradesperson" value="TRADESPERSON" />
                                <Picker.Item label="Admin" value="ADMIN" />
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>
                            Password {editing ? "(leave blank to keep current)" : "*"}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            value={formData.password}
                            onChangeText={(text) => onFormChange({ ...formData, password: text })}
                            secureTextEntry
                            placeholderTextColor="#94A3B8"
                        />
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
