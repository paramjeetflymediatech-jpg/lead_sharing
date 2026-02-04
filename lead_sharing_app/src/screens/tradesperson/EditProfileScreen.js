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
import { tradespersonAPI } from "../../services/api";

export default function EditProfileScreen({ navigation }) {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [formData, setFormData] = useState({
        company_name: "",
        contact_name: user?.name || "",
        phone: "",
        service_areas: "",
        bio: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const profile = await tradespersonAPI.getProfile();
            if (profile) {
                setFormData({
                    company_name: profile.company_name || "",
                    contact_name: profile.contact_name || user?.name || "",
                    phone: profile.phone || "",
                    service_areas: profile.service_areas?.join(", ") || "",
                    bio: profile.bio || "",
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    }

    function updateField(field, value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        if (!formData.company_name.trim()) {
            Alert.alert("Error", "Company name is required");
            return;
        }

        try {
            setLoading(true);

            const profileData = {
                ...formData,
                service_areas: formData.service_areas
                    ? formData.service_areas.split(",").map(s => s.trim()).filter(Boolean)
                    : [],
            };

            await tradespersonAPI.updateProfile(profileData);

            if (updateUser) {
                updateUser({ ...user, name: formData.contact_name });
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

    if (loadingProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <Text style={styles.headerSubtitle}>Update your business information</Text>
            </View>

            {/* Company Name */}
            <View style={styles.section}>
                <Text style={styles.label}>Company Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Your company name"
                    value={formData.company_name}
                    onChangeText={(value) => updateField("company_name", value)}
                />
            </View>

            {/* Contact Name */}
            <View style={styles.section}>
                <Text style={styles.label}>Contact Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={formData.contact_name}
                    onChangeText={(value) => updateField("contact_name", value)}
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

            {/* Service Areas */}
            <View style={styles.section}>
                <Text style={styles.label}>Service Areas (Postcodes)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. SW1, W1, WC1 (comma separated)"
                    value={formData.service_areas}
                    onChangeText={(value) => updateField("service_areas", value)}
                    autoCapitalize="characters"
                />
                <Text style={styles.hint}>Enter postcodes separated by commas</Text>
            </View>

            {/* Bio */}
            <View style={styles.section}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Tell homeowners about your business..."
                    multiline
                    numberOfLines={4}
                    value={formData.bio}
                    onChangeText={(value) => updateField("bio", value)}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        minHeight: 100,
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
