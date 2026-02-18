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
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

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

            // Backwards compatibility: Split name into firstName and lastName for /api/me
            const nameParts = formData.name.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "";

            // Prepare payload for /api/me
            const apiPayload = {
                firstName,
                lastName,
                phone: formData.phone,
                address: {
                    line1: formData.address,
                    postcode: formData.postcode,
                },
            };

            // Use updateMe instead of updateProfile
            const updatedData = await userAPI.updateMe(apiPayload);

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <Text style={styles.headerSubtitle}>Update your personal details</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. John Doe"
                                placeholderTextColor="#9CA3AF"
                                value={formData.name}
                                onChangeText={(value) => updateField("name", value)}
                            />
                        </View>
                    </View>

                    {/* Email (Read-only) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputWrapper, styles.inputDisabled]}>
                            <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: "#6B7280" }]}
                                value={user?.email || ""}
                                editable={false}
                            />
                            <Feather name="lock" size={16} color="#9CA3AF" />
                        </View>
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 416-555-0123"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(value) => updateField("phone", value)}
                            />
                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <Feather name="map" size={20} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 12 }]} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Your street address..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                value={formData.address}
                                onChangeText={(value) => updateField("address", value)}
                            />
                        </View>
                    </View>

                    {/* Postcode */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Postcode</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="map-pin" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. A1A 1A1"
                                placeholderTextColor="#9CA3AF"
                                value={formData.postcode}
                                onChangeText={(value) => updateField("postcode", value.toUpperCase())}
                                autoCapitalize="characters"
                            />
                        </View>
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
                            <>
                                <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingTop: hp(6), // Adjusted for safe area
        paddingBottom: hp(2),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        marginRight: wp(3),
        padding: wp(2),
        marginLeft: -wp(2),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: normalize(13),
        color: "#6B7280",
        marginTop: hp(0.2),
    },
    formContainer: {
        padding: wp(4),
        paddingBottom: hp(5),
    },
    inputGroup: {
        marginBottom: hp(2.5),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#374151",
        marginBottom: hp(0.8),
    },
    required: {
        color: "#EF4444",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        height: hp(7), // Consistent height
    },
    inputIcon: {
        marginRight: wp(2.5),
    },
    input: {
        flex: 1,
        fontSize: normalize(15),
        color: "#1F2937",
        height: "100%", // Full height
    },
    inputDisabled: {
        backgroundColor: "#F9FAFB",
        borderColor: "#F3F4F6",
    },
    textAreaWrapper: {
        alignItems: "flex-start",
        paddingVertical: 0,
        height: "auto", // Auto height for text area wrapper
        minHeight: hp(12),
    },
    textArea: {
        height: hp(10),
        textAlignVertical: "top",
        paddingTop: hp(1.5),
    },
    helperText: {
        fontSize: normalize(12),
        color: "#9CA3AF",
        marginTop: hp(0.8),
        marginLeft: wp(1),
    },
    saveButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2563EB",
        borderRadius: wp(3),
        paddingVertical: hp(1.8),
        marginTop: hp(1.5),
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: hp(2),
        marginTop: hp(0.5),
    },
    cancelButtonText: {
        color: "#6B7280",
        fontSize: normalize(15),
        fontWeight: "600",
    },
});
