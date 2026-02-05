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
import { Picker } from "@react-native-picker/picker";
import { categoryAPI, subcategoryAPI, jobAPI } from "../../services/api";

export default function PostJobScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        category_id: "",
        subcategory_id: "",
        description: "",
        property_type: "HOUSE",
        postcode: "",
        budget_min: "",
        budget_max: "",
        start_time: "FLEXIBLE",
        urgency: "NORMAL",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (formData.category_id) {
            loadSubcategories(formData.category_id);
        } else {
            setSubcategories([]);
            setFormData((prev) => ({ ...prev, subcategory_id: "" }));
        }
    }, [formData.category_id]);

    async function loadCategories() {
        try {
            setLoadingData(true);
            const data = await categoryAPI.getAll();
            const catList = Array.isArray(data) ? data : data?.categories || [];
            setCategories(catList);
        } catch (error) {
            console.error("Error loading categories:", error);
            Alert.alert("Error", "Failed to load categories");
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

        try {
            setLoading(true);

            // Convert to numbers
            const jobData = {
                ...formData,
                category_id: parseInt(formData.category_id),
                subcategory_id: formData.subcategory_id
                    ? parseInt(formData.subcategory_id)
                    : null,
                budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
                budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
            };

            await jobAPI.create(jobData);

            Alert.alert("Success", "Job posted successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Post a New Job</Text>
                <Text style={styles.headerSubtitle}>Get quotes from local tradespeople</Text>
            </View>

            {/* Category */}
            <View style={styles.section}>
                <Text style={styles.label}>Category *</Text>
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

            {/* Subcategory */}
            {subcategories.length > 0 && (
                <View style={styles.section}>
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

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.label}>Job Description *</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Describe the work you need done..."
                    multiline
                    numberOfLines={4}
                    value={formData.description}
                    onChangeText={(value) => updateField("description", value)}
                />
            </View>

            {/* Property Type */}
            <View style={styles.section}>
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

            {/* Postcode */}
            <View style={styles.section}>
                <Text style={styles.label}>Postcode *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. SW1A 1AA"
                    value={formData.postcode}
                    onChangeText={(value) => updateField("postcode", value.toUpperCase())}
                    autoCapitalize="characters"
                />
            </View>

            {/* Budget */}
            <View style={styles.section}>
                <Text style={styles.label}>Budget Range (Optional)</Text>
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.smallLabel}>Min (£)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 100"
                            keyboardType="numeric"
                            value={formData.budget_min}
                            onChangeText={(value) => updateField("budget_min", value)}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.smallLabel}>Max (£)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 500"
                            keyboardType="numeric"
                            value={formData.budget_max}
                            onChangeText={(value) => updateField("budget_max", value)}
                        />
                    </View>
                </View>
            </View>

            {/* Start Time */}
            <View style={styles.section}>
                <Text style={styles.label}>When do you need this done?</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.start_time}
                        onValueChange={(value) => updateField("start_time", value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Flexible" value="FLEXIBLE" />
                        <Picker.Item label="Within 24 hours" value="WITHIN_24_HOURS" />
                        <Picker.Item label="Within a week" value="WITHIN_A_WEEK" />
                        <Picker.Item label="Within a month" value="WITHIN_A_MONTH" />
                        <Picker.Item label="More than a month" value="MORE_THAN_A_MONTH" />
                    </Picker>
                </View>
            </View>

            {/* Urgency */}
            <View style={styles.section}>
                <Text style={styles.label}>Urgency Level</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.urgency}
                        onValueChange={(value) => updateField("urgency", value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Normal" value="NORMAL" />
                        <Picker.Item label="Urgent" value="URGENT" />
                        <Picker.Item label="Emergency" value="EMERGENCY" />
                    </Picker>
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
                    <Text style={styles.submitButtonText}>Post Job</Text>
                )}
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
    smallLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#6B7280",
        marginBottom: 6,
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
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    submitButton: {
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
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
});
