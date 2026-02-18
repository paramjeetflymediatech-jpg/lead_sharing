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
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { categoryAPI, subcategoryAPI, jobAPI, userAPI, uploadAPI } from "../../services/api"; // Added userAPI, uploadAPI
import SuccessModal from "../../components/SuccessModal";
import { Feather } from "@expo/vector-icons";
import { Image } from "react-native";
import { normalize, wp, hp } from "../../utils/responsive";

export default function PostJobScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Added for success modal

    // Form state
    const [formData, setFormData] = useState({
        category_id: "",
        subcategory_id: "",
        description: "",
        property_type: "HOUSE",
        ownership: "OWNER",
        postcode: "",
        city: "",
        budget_min: "",
        budget_max: "",
        start_time: "WITHIN_2_WEEKS",
        job_stage: "PLANNING",
        contactName: "", // Added
        contactPhone: "", // Added
        contactEmail: "", // Added
    });

    const [media, setMedia] = useState([]); // Added for images

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (formData.category_id) {
            loadSubcategories(formData.category_id);
        } else {
            setSubcategories([]);
            setFormData((prev) => ({ ...prev, subcategory_id: "" }));
        }
    }, [formData.category_id]);

    async function loadInitialData() {
        try {
            setLoadingData(true);
            const [catData, userData] = await Promise.all([
                categoryAPI.getAll(),
                userAPI.getMe().catch(() => null), // Fail silently if not logged in or error
            ]);

            const catList = Array.isArray(catData) ? catData : catData?.categories || [];
            setCategories(catList);

            // Prefill contact info
            if (userData) {
                const user = userData.user || userData;
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        contactName: user.name || "",
                        contactPhone: user.phone || "",
                        contactEmail: user.email || "",
                    }));
                }
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
            Alert.alert("Error", "Failed to load data");
        } finally {
            setLoadingData(false);
        }
    }

    async function loadSubcategories(categoryId) {
        try {
            const data = await subcategoryAPI.getAll(categoryId);
            const subList = Array.isArray(data) ? data : data?.subcategories || [];
            setSubcategories(subList);
        } catch (error) {
            console.error("Error loading subcategories:", error);
        }
    }

    function updateField(field, value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission required", "Sorry, we need camera roll permissions to make this work!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            if (!asset.uri) {
                Alert.alert("Error", "Could not get image URI");
                return;
            }
            if (media.length >= 2) {
                Alert.alert("Limit Reached", "You can only upload up to 2 images.");
                return;
            }
            setMedia([...media, asset]);
        }
    };

    const removeImage = (index) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setMedia(newMedia);
    };

    async function handleSubmit() {
        // Validation
        if (!formData.category_id) {
            Alert.alert("Error", "Please select a category");
            return;
        }
        if (!formData.description.trim()) {
            Alert.alert("Error", "Please enter a job description");
            return;
        }
        if (!formData.postcode.trim()) {
            Alert.alert("Error", "Please enter your postcode");
            return;
        }
        if (!formData.contactName.trim()) {
            Alert.alert("Error", "Please enter your full name");
            return;
        }
        if (!formData.contactPhone.trim()) {
            Alert.alert("Error", "Please enter your phone number");
            return;
        }
        if (!formData.contactEmail.trim()) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        try {
            setLoading(true);

            // Upload images first
            const uploadedMedia = [];
            if (media.length > 0) {
                for (const asset of media) {
                    const localUri = asset.uri;
                    const filename = localUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;

                    const file = {
                        uri: localUri,
                        name: filename,
                        type: type,
                    };

                    try {
                        const uploadRes = await uploadAPI.uploadImage(file);
                        if (uploadRes && uploadRes.url) {
                            uploadedMedia.push({ url: uploadRes.url, type: 'IMAGE' }); // Adjust structure based on what backend expects for media array
                        }
                    } catch (uploadError) {
                        console.error("Image upload failed:", uploadError);
                        Alert.alert("Upload Error", "Failed to upload one or more images.");
                        setLoading(false);
                        return;
                    }
                }
            }

            // Convert to numbers
            // detailed description with property type
            const jobData = {
                category: parseInt(formData.category_id),
                subCategory: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
                description: formData.description,
                propertyType: formData.property_type,
                budgetMin: formData.budget_min ? parseFloat(formData.budget_min) : null,
                budgetMax: formData.budget_max ? parseFloat(formData.budget_max) : null,
                startTime: formData.start_time,
                jobStage: formData.job_stage,
                ownership: formData.ownership,
                // location: {
                //     postcode: formData.postcode,
                //     city: formData.city,
                // },
                postcode: formData.postcode, // Ensure backend receives flattened field if needed
                city: formData.city, // Ensure backend receives flattened field if needed
                contactName: formData.contactName,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                media: uploadedMedia,
                images: uploadedMedia.filter(m => m && m.url).map(m => m.url), // Add safety check
            };

            console.log("Submitting Job Payload:", JSON.stringify(jobData, null, 2));

            await jobAPI.create(jobData);

            // Alert.alert("Success", "Job posted successfully!", [
            //     {
            //         text: "OK",
            //         onPress: () => navigation.goBack(),
            //     },
            // ]);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error posting job:", error);
            Alert.alert("Error", error.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    }

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Post a New Job</Text>
                        <Text style={styles.headerSubtitle}>Get quotes from local tradespeople</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    {/* Category Selection */}
                    <View style={styles.sectionHeader}>
                        <Feather name="grid" size={18} color="#2563EB" />
                        <Text style={styles.sectionTitle}>Type of Work</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.category_id}
                                    onValueChange={(value) => updateField("category_id", value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a category..." value="" />
                                    {categories.map((cat, index) => (
                                        <Picker.Item key={cat.id || index} label={cat.name} value={cat.id.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {subcategories.length > 0 && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subcategory</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.subcategory_id}
                                        onValueChange={(value) => updateField("subcategory_id", value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select a subcategory..." value="" />
                                        {subcategories.map((sub, index) => (
                                            <Picker.Item key={sub.id || index} label={sub.name} value={sub.id.toString()} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Job Details */}
                    <View style={styles.sectionHeader}>
                        <Feather name="file-text" size={18} color="#2563EB" />
                        <Text style={styles.sectionTitle}>Job Details</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe the work you need done..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(value) => updateField("description", value)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Photos (Optional)</Text>
                            <View style={styles.mediaContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {media.map((asset, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri: asset.uri }} style={styles.imagePreview} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                            >
                                                <Feather name="x" size={12} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {media.length < 2 && (
                                        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                            <Feather name="plus" size={24} color="#6B7280" />
                                            <Text style={styles.addImageText}>Add Photo</Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.property_type}
                                    onValueChange={(value) => updateField("property_type", value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="House" value="HOUSE" />
                                    <Picker.Item label="Flat/Apartment" value="FLAT" />
                                    <Picker.Item label="Commercial" value="COMMERCIAL" />
                                    <Picker.Item label="Other" value="OTHER" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ownership Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.ownership}
                                    onValueChange={(value) => updateField("ownership", value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="I own and live at this property" value="OWNER" />
                                    <Picker.Item label="I am the landlord" value="LANDLORD" />
                                    <Picker.Item label="I rent, but am authorised" value="AUTHORIZED" />
                                    <Picker.Item label="I am looking to buy" value="BUYING" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Postcode <Text style={styles.required}>*</Text></Text>
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>City</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="map" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Toronto"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.city}
                                    onChangeText={(value) => updateField("city", value)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Contact Info */}
                    <View style={styles.sectionHeader}>
                        <Feather name="user" size={18} color="#2563EB" />
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Full Name"
                                placeholderTextColor="#9CA3AF"
                                value={formData.contactName}
                                onChangeText={(value) => updateField("contactName", value)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Phone Number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={formData.contactPhone}
                                onChangeText={(value) => updateField("contactPhone", value)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Email Address"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.contactEmail}
                                onChangeText={(value) => updateField("contactEmail", value)}
                            />
                        </View>
                    </View>

                    {/* Budget & Timing */}
                    <View style={styles.sectionHeader}>
                        <Feather name="clock" size={18} color="#2563EB" />
                        <Text style={styles.sectionTitle}>Budget & Timing</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Budget Range ($)</Text>
                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Min"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={formData.budget_min}
                                        onChangeText={(value) => updateField("budget_min", value)}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Max"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={formData.budget_max}
                                        onChangeText={(value) => updateField("budget_max", value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>When do you need the work done?</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.start_time}
                                    onValueChange={(value) => updateField("start_time", value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Urgent" value="URGENT" />
                                    <Picker.Item label="Within 2 Days" value="WITHIN_2_DAYS" />
                                    <Picker.Item label="Within 2 Weeks" value="WITHIN_2_WEEKS" />
                                    <Picker.Item label="Within 2 Months" value="WITHIN_2_MONTHS" />
                                    <Picker.Item label="Flexible" value="FLEXIBLE" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Stage</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.job_stage}
                                    onValueChange={(value) => updateField("job_stage", value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Ready to hire" value="READY_TO_HIRE" />
                                    <Picker.Item label="Planning" value="PLANNING" />
                                    <Picker.Item label="Insurance work" value="INSURANCE_WORK" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Feather name="send" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>Post Job</Text>
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

            <SuccessModal
                visible={showSuccessModal}
                title="Success!"
                subtitle="Your job has been posted successfully. Tradespeople will be in touch soon."
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }}
            />
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
        paddingTop: hp(6), // Adjusted for better safe area on small screens
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
        fontSize: normalize(12),
        color: "#6B7280",
        marginTop: hp(0.2),
    },
    formContainer: {
        padding: wp(4),
        paddingBottom: hp(10), // Extra padding at bottom for scroll
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(1.5),
        marginTop: hp(1),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1F2937",
        marginLeft: wp(2),
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    inputGroup: {
        marginBottom: hp(2),
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
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        height: hp(7), // Increased height for better visibility
    },
    pickerContainer: {
        backgroundColor: "#F9FAFB",
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        height: hp(5), // Match input height
        justifyContent: "center",
    },
    picker: {
        height: hp(10),
        width: "100%",
        color: "#1F2937", // Ensure text is visible
    },
    inputIcon: {
        marginRight: wp(2.5),
    },
    input: {
        flex: 1,
        fontSize: normalize(13), // Reduced for better fit on small screens
        color: "#1F2937",
        height: "100%", // Take full height of wrapper
    },
    textArea: {
        backgroundColor: "#F9FAFB",
        borderRadius: wp(3),
        padding: wp(3),
        fontSize: normalize(15),
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: hp(15), // Taller text area
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
        gap: wp(3),
    },
    halfInput: {
        flex: 1,
    },
    submitButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2563EB",
        borderRadius: wp(3),
        paddingVertical: hp(1.8),
        marginTop: hp(1),
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: hp(2),
    },
    cancelButtonText: {
        color: "#6B7280",
        fontSize: normalize(15),
        fontWeight: "600",
    },
    mediaContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp(0.5),
    },
    imageWrapper: {
        position: "relative",
        marginRight: wp(3),
    },
    imagePreview: {
        width: wp(22),
        height: wp(22),
        borderRadius: wp(2),
        backgroundColor: "#E5E7EB",
        resizeMode: "cover",
    },
    removeImageButton: {
        position: "absolute",
        top: -wp(1.5),
        right: -wp(1.5),
        backgroundColor: "#EF4444",
        borderRadius: wp(3),
        padding: wp(1),
        zIndex: 5,
        elevation: 2,
    },
    addImageButton: {
        width: wp(22),
        height: wp(22),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    addImageText: {
        fontSize: normalize(11),
        color: "#6B7280",
        marginTop: hp(0.5),
        fontWeight: "500",
    },
});
