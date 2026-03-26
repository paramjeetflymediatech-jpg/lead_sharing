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
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { userAPI, uploadAPI } from "../../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function EditProfileScreen({ navigation }) {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.profile_image || user?.profileImage || null);
    const [newImage, setNewImage] = useState(null); // To track if a new image was picked

    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address_line1 || user?.address?.line1 || "", // Handle nested or flat address
        postcode: user?.postcode || user?.address?.postcode || "",
    });

    useEffect(() => {
        // Sync state with user data if it changes (e.g. initial load)
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address_line1 || user.address?.line1 || "",
                postcode: user.postcode || user.address?.postcode || "",
            });
            setProfileImage(user.profile_image || user.profileImage || null);
        }
    }, [user]);

    function updateField(field, value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setNewImage(result.assets[0]);
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    async function handleSave() {
        if (!formData.name.trim()) {
            Alert.alert("Error", "Name is required");
            return;
        }

        if (!formData.phone.trim()) {
            Alert.alert("Error", "Phone number is required");
            return;
        }

        if (formData.phone.length < 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        // if (!formData.address.trim()) {
        //     Alert.alert("Error", "Address is required");
        //     return;
        // }

        // if (!formData.postcode.trim()) {
        //     Alert.alert("Error", "Postcode is required");
        //     return;
        // }

        const postcodeRegex = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i;
        if (formData.postcode.trim() && !postcodeRegex.test(formData.postcode.trim())) {
            Alert.alert("Error", "Please enter a valid Canadian postcode (e.g. A1A 1A1)");
            return;
        }

        try {
            setLoading(true);

            let uploadedImageUrl = profileImage;

            // Upload new image if selected
            if (newImage) {
                // Determine file type
                const fileType = newImage.type === 'image' ? 'image/jpeg' : newImage.type;
                const fileName = newImage.fileName || 'profile.jpg';

                const imageFile = {
                    uri: newImage.uri,
                    name: fileName,
                    type: fileType || 'image/jpeg',
                };

                try {
                    const uploadResult = await uploadAPI.uploadImage(imageFile);
                    uploadedImageUrl = uploadResult.url;
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
                    Alert.alert("Upload Error", "Failed to upload profile image. Continuing with text updates.");
                    // Optional: return or continue? Continuing with old image or failing.
                    // For now, let's stop but keep the logic simple.
                    // If strict, return here.
                }
            }

            // Backwards compatibility: Split name into firstName and lastName for /api/me
            const nameParts = formData.name.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "";

            // Prepare payload for /api/me
            const apiPayload = {
                firstName,
                lastName,
                phone: formData.phone,
                profileImage: uploadedImageUrl,
                address: {
                    line1: formData.address,
                    postcode: formData.postcode,
                },
            };

            // Use updateMe instead of updateProfile
            const updatedData = await userAPI.updateMe(apiPayload);

            // Update context
            if (updateUser) {
                const newUserData = {
                    ...user,
                    name: formData.name,
                    phone: formData.phone,
                    address_line1: formData.address, // Use address_line1 to match useEffect mapping
                    postcode: formData.postcode,     // Ensure postcode is synced
                    profile_image: uploadedImageUrl,
                    profileImage: uploadedImageUrl
                };
                updateUser(newUserData);
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
                    {/* Profile Image Picker */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Feather name="user" size={40} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Feather name="camera" size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>Tap to change photo</Text>
                    </View>

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
                                onChangeText={(value) => {
                                    const numericValue = value.replace(/[^0-9]/g, '');
                                    updateField("phone", numericValue);
                                }}
                                maxLength={15}
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
                                onChangeText={(value) => {
                                    let formatted = value.toUpperCase();
                                    if (formatted.length === 3 && formData.postcode.length === 2) {
                                        formatted += " ";
                                    }
                                    updateField("postcode", formatted);
                                }}
                                maxLength={7}
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
    imageContainer: {
        alignItems: "center",
        marginBottom: hp(3),
    },
    imageWrapper: {
        position: "relative",
    },
    profileImage: {
        width: wp(25),
        height: wp(25),
        borderRadius: wp(12.5),
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    placeholderImage: {
        width: wp(25),
        height: wp(25),
        borderRadius: wp(12.5),
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    editIconBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#2563EB",
        padding: wp(2),
        borderRadius: wp(5),
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    changePhotoText: {
        marginTop: hp(1),
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "600",
    },
});
