import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
    Dimensions,
} from "react-native";
import { authAPI } from "../services/api";
import SuccessModal from "../components/SuccessModal";

const { height } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const validateEmail = (value) => {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
    };

    async function handleResetPassword() {
        setError("");

        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.forgotPassword(email.trim().toLowerCase());

            setSuccessModalVisible(true);

            setEmail("");
        } catch (error) {
            setError(error.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}

                {/* <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity> */}

                {/* Illustration Section */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require("../../assets/forgot-password-illustration.jpg")}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry! It happens. Please enter the email address associated
                            with your account.
                        </Text>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email ID / Mobile number"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit</Text>
                        )}
                    </TouchableOpacity>

                    {/* Back to Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Remember password? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <SuccessModal
                visible={successModalVisible}
                title="Check your email"
                message="If this email is registered, you will receive a reset link shortly."
                buttonText="Back to Login"
                onClose={() => {
                    setSuccessModalVisible(false);
                    navigation.navigate("Login");
                }}
            />
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    scrollContent: {
        flexGrow: 1,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "600",
    },
    illustrationContainer: {
        backgroundColor: "#FFFFFF",
        paddingTop: 80,
        paddingBottom: 30,
        paddingHorizontal: 40,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    illustration: {
        width: 280,
        height: 240,
    },
    formCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 28,
        marginTop: -20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "400",
        lineHeight: 22,
    },
    errorContainer: {
        backgroundColor: "#FEE2E2",
        borderLeftWidth: 4,
        borderLeftColor: "#EF4444",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 14,
        fontWeight: "500",
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 16,
    },

    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 15,
        color: "#1F2937",
    },
    submitButton: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        padding: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 56,
        marginBottom: 24,
    },
    submitButtonDisabled: {
        backgroundColor: "#93C5FD",
        shadowOpacity: 0.1,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: {
        color: "#6B7280",
        fontSize: 15,
    },
    loginLink: {
        color: "#2563EB",
        fontSize: 15,
        fontWeight: "700",
    },
});
