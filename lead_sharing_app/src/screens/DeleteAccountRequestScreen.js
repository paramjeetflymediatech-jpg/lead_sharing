import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../utils/responsive";
import { userAPI } from "../services/api";

export default function DeleteAccountRequestScreen({ navigation }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitRequest = async () => {
        if (!reason.trim()) {
            Alert.alert("Error", "Please provide a reason for account deletion");
            return;
        }

        Alert.alert(
            "Confirm Request",
            "Are you sure you want to submit a request to delete your account? This action cannot be undone once approved by admin.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Submit",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Using the new API method
                            await userAPI.requestAccountDeletion(reason);
                            Alert.alert(
                                "Success",
                                "Your deletion request has been submitted. Our team will review it and process it shortly.",
                                [{ text: "OK", onPress: () => navigation.pop(2) }] // Go back to profile
                            );
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to submit request");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delete Account Request</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.warningCard}>
                        <Feather name="alert-triangle" size={24} color="#EF4444" />
                        <Text style={styles.warningText}>
                            Account deletion is permanent. Once your request is processed by the admin, all your data will be removed.
                        </Text>
                    </View>

                    <Text style={styles.description}>
                        Please tell us why you would like to delete your account. This will help us improve our service.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Reason for Deletion</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Tell us your reason..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={reason}
                            onChangeText={setReason}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmitRequest}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Submit Deletion Request</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>I've changed my mind</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(7),
        paddingBottom: hp(2),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: wp(4),
        padding: wp(1),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: wp(5),
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(3),
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        fontSize: normalize(14),
        color: '#B91C1C',
        marginLeft: wp(3),
        fontWeight: '500',
    },
    description: {
        fontSize: normalize(15),
        color: '#4B5563',
        marginBottom: hp(3),
        lineHeight: normalize(22),
    },
    inputGroup: {
        marginBottom: hp(3),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: hp(1),
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wp(3),
        padding: wp(4),
        fontSize: normalize(16),
        color: '#1F2937',
        minHeight: hp(20),
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#EF4444',
        borderRadius: wp(3),
        height: hp(7),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '700',
    },
    cancelButton: {
        marginTop: hp(2),
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#2563EB',
        fontSize: normalize(15),
        fontWeight: '600',
    },
});
