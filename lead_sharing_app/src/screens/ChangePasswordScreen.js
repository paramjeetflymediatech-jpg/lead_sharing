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
import { authAPI } from "../services/api";

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await authAPI.updatePassword(currentPassword, newPassword);
            Alert.alert("Success", "Password updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, setValue, show, setShow, placeholder) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!show}
                />
                <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
                    <Feather name={show ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                    <Text style={styles.headerTitle}>Change Password</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        Ensure your account is secure by using a strong password.
                    </Text>

                    {renderInput("Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent, "Enter current password")}
                    {renderInput("New Password", newPassword, setNewPassword, showNew, setShowNew, "Enter new password")}
                    {renderInput("Confirm New Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, "Confirm new password")}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Update Password</Text>
                        )}
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
    description: {
        fontSize: normalize(15),
        color: '#6B7280',
        marginBottom: hp(4),
        lineHeight: normalize(22),
    },
    inputGroup: {
        marginBottom: hp(2.5),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: hp(1),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        height: hp(7),
    },
    input: {
        flex: 1,
        fontSize: normalize(16),
        color: '#1F2937',
    },
    eyeIcon: {
        padding: wp(2),
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: wp(3),
        height: hp(7),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
        shadowColor: "#2563EB",
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
});
