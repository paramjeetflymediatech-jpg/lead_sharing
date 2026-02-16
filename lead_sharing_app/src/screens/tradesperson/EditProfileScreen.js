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
import { tradespersonAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <Text style={styles.headerSubtitle}>Update your business details</Text>
                    </View>
                </View> */}

                <View style={styles.formContainer}>
                    {/* Company Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company Name <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="briefcase" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Acme Plumbing"
                                placeholderTextColor="#9CA3AF"
                                value={formData.company_name}
                                onChangeText={(value) => updateField("company_name", value)}
                            />
                        </View>
                    </View>

                    {/* Contact Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Name <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your full name"
                                placeholderTextColor="#9CA3AF"
                                value={formData.contact_name}
                                onChangeText={(value) => updateField("contact_name", value)}
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
                        <Text style={styles.helperText}>Email cannot be changed.</Text>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 07700 900000"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(value) => updateField("phone", value)}
                            />
                        </View>
                    </View>

                    {/* Service Areas */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Areas</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="map-pin" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. SW1, W1, WC1"
                                placeholderTextColor="#9CA3AF"
                                value={formData.service_areas}
                                onChangeText={(value) => updateField("service_areas", value)}
                                autoCapitalize="characters"
                            />
                        </View>
                        <Text style={styles.helperText}>Comma-separated postcodes.</Text>
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Business Bio</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <Feather name="align-left" size={20} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 12 }]} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your services and experience..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                value={formData.bio}
                                onChangeText={(value) => updateField("bio", value)}
                            />
                        </View>
                    </View>

                    {/* Actions */}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingTop: hp(7),
        paddingBottom: hp(2.5),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        marginRight: wp(4),
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
    },
    formContainer: {
        padding: wp(5),
    },
    inputGroup: {
        marginBottom: hp(2.5),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#374151",
        marginBottom: hp(1),
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
        minHeight: hp(6),
    },
    inputIcon: {
        marginRight: wp(2.5),
    },
    input: {
        flex: 1,
        fontSize: normalize(15),
        color: "#1F2937",
        paddingVertical: hp(1.5),
    },
    inputDisabled: {
        backgroundColor: "#F9FAFB",
        borderColor: "#F3F4F6",
    },
    textAreaWrapper: {
        alignItems: "flex-start",
        paddingVertical: 0,
    },
    textArea: {
        height: hp(12),
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
        paddingVertical: hp(2),
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
        marginTop: hp(1),
    },
    cancelButtonText: {
        color: "#6B7280",
        fontSize: normalize(15),
        fontWeight: "600",
    },
});
