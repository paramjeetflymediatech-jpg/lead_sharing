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

export default function AdminEditProfileScreen({ onNavigate, goBack }) {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.profile_image || user?.profileImage || null);
    const [newImage, setNewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: user?.name || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
            });
            setProfileImage(user.profile_image || user.profileImage || null);
        }
    }, [user]);

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

        try {
            setLoading(true);

            let uploadedImageUrl = profileImage;

            if (newImage) {
                const imageFile = {
                    uri: newImage.uri,
                    name: newImage.fileName || 'profile.jpg',
                    type: newImage.type === 'image' ? 'image/jpeg' : (newImage.type || 'image/jpeg'),
                };

                try {
                    const uploadResult = await uploadAPI.uploadImage(imageFile);
                    uploadedImageUrl = uploadResult.url;
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
                    Alert.alert("Upload Error", "Failed to upload profile image.");
                    return;
                }
            }

            const nameParts = formData.name.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "";

            const apiPayload = {
                firstName,
                lastName,
                profileImage: uploadedImageUrl,
            };

            await userAPI.updateMe(apiPayload);

            if (updateUser) {
                updateUser({
                    ...user,
                    name: formData.name,
                    profile_image: uploadedImageUrl,
                    profileImage: uploadedImageUrl
                });
            }

            Alert.alert("Success", "Profile updated successfully!", [
                {
                    text: "OK",
                    onPress: () => goBack ? goBack() : onNavigate("Profile"),
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

                <View style={styles.formContainer}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Feather name="user" size={40} color="#94A3B8" />
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Feather name="camera" size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>Tap to change photo</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                placeholderTextColor="#94A3B8"
                                value={formData.name}
                                onChangeText={(value) => setFormData({ ...formData, name: value })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputWrapper, styles.inputDisabled]}>
                            <Feather name="mail" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: "#64748B" }]}
                                value={user?.email || ""}
                                editable={false}
                            />
                            <Feather name="lock" size={16} color="#94A3B8" />
                        </View>
                        <Text style={styles.helperText}>Email is linked to your admin account</Text>
                    </View>

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
                        onPress={() => goBack ? goBack() : onNavigate("Profile")}
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
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(2),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        marginRight: wp(3),
        padding: wp(2),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1E293B",
    },
    headerSubtitle: {
        fontSize: normalize(13),
        color: "#64748B",
        marginTop: 2,
    },
    formContainer: {
        padding: wp(5),
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: hp(4),
    },
    imageWrapper: {
        position: "relative",
    },
    profileImage: {
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        borderWidth: 4,
        borderColor: "#FFFFFF",
    },
    placeholderImage: {
        width: wp(28),
        height: wp(28),
        borderRadius: wp(14),
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#FFFFFF",
    },
    editIconBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "#2563EB",
        padding: wp(2),
        borderRadius: wp(5),
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    changePhotoText: {
        marginTop: hp(1.5),
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "600",
    },
    inputGroup: {
        marginBottom: hp(3),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#475569",
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
        borderColor: "#E2E8F0",
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        height: hp(7),
    },
    inputIcon: {
        marginRight: wp(3),
    },
    input: {
        flex: 1,
        fontSize: normalize(16),
        color: "#1E293B",
    },
    inputDisabled: {
        backgroundColor: "#F8FAFC",
        borderColor: "#F1F5F9",
    },
    helperText: {
        fontSize: normalize(12),
        color: "#94A3B8",
        marginTop: hp(1),
    },
    saveButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2563EB",
        borderRadius: wp(3),
        paddingVertical: hp(2),
        marginTop: hp(2),
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
        color: "#64748B",
        fontSize: normalize(15),
        fontWeight: "600",
    },
});
