import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function EditProfileScreen({ navigation }) {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: "",
        address: "",
        postcode: "",
    });

    function updateField(field, value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        if (!formData.name.trim()) {
            Alert.alert("Error", "Name is required");
            return;
        }

        try {
            setLoading(true);
            const updatedData = await userAPI.updateProfile(formData);

            // Update context
            if (updateUser) {
                updateUser({ ...user, ...formData });
            }

            Alert.alert("Success", "Profile updated successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <Text style={styles.headerSubtitle}>Update your account information</Text>
            </View>

            {/* Name */}
            <View style={styles.section}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={formData.name}
                    onChangeText={(value) => updateField("name", value)}
                />
            </View>

            {/* Email (Read-only) */}
            <View style={styles.section}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={user?.email || ""}
                    editable={false}
                />
                <Text style={styles.hint}>Email cannot be changed</Text>
            </View>

            {/* Phone */}
            <View style={styles.section}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 07700 900000"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(value) => updateField("phone", value)}
                />
            </View>

            {/* Address */}
            <View style={styles.section}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Your address"
                    multiline
                    numberOfLines={3}
                    value={formData.address}
                    onChangeText={(value) => updateField("address", value)}
                />
            </View>

            {/* Postcode */}
            <View style={styles.section}>
                <Text style={styles.label}>Postcode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. SW1A 1AA"
                    value={formData.postcode}
                    onChangeText={(value) => updateField("postcode", value.toUpperCase())}
                    autoCapitalize="characters"
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    inputDisabled: {
        backgroundColor: "#F3F4F6",
        color: "#9CA3AF",
    },
    textArea: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: 80,
        textAlignVertical: "top",
    },
    hint: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 6,
    },
    saveButton: {
        backgroundColor: "#2563EB",
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    cancelButton: {
        backgroundColor: "transparent",
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#6B7280",
        fontSize: 15,
        fontWeight: "600",
    },
});
