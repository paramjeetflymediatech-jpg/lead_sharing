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
} from "react-native";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
    const { login } = useAuth();
    const [role, setRole] = useState("HOMEOWNER");
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validation functions
    const validateName = (value) => {
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
    };

    const validateCompanyName = (value) => {
        if (role === "TRADESPERSON") {
            if (!value.trim()) return "Company name is required";
            if (value.trim().length < 2)
                return "Company name must be at least 2 characters";
        }
        return "";
    };

    const validateEmail = (value) => {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
    };

    const validatePassword = (value) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return "Must contain uppercase, lowercase, and number";
        }
        return "";
    };

    async function handleSignup() {
        setError("");

        // Validate all fields
        const nameError = validateName(name);
        const companyError = validateCompanyName(companyName);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (nameError || companyError || emailError || passwordError) {
            setError(
                nameError || companyError || emailError || passwordError
            );
            return;
        }

        setLoading(true);

        const body = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
        };

        if (role === "TRADESPERSON") {
            body.companyName = companyName.trim();
        }

        try {
            const data = await authAPI.register(body);

            // Auto-login after successful registration
            if (data.token) {
                await login({
                    token: data.token,
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    name: data.name,
                });
            } else {
                // If no token, redirect to login
                navigation?.navigate?.("Login");
            }
        } catch (error) {
            setError(error.message || "Registration failed. Please try again.");
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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Get <Text style={styles.titleHighlight}>Started</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        {role === "HOMEOWNER"
                            ? "Find the best pros for your home project."
                            : "Grow your trade business with quality leads."}
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.formContainer}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Role Switcher */}
                    <View style={styles.roleSwitcher}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === "HOMEOWNER" && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole("HOMEOWNER")}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    role === "HOMEOWNER" && styles.roleButtonTextActive,
                                ]}
                            >
                                Homeowner
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === "TRADESPERSON" && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole("TRADESPERSON")}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    role === "TRADESPERSON" && styles.roleButtonTextActive,
                                ]}
                            >
                                Tradesperson
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    {/* Company Name Input (for Tradesperson) */}
                    {role === "TRADESPERSON" && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>COMPANY NAME</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter company name"
                                placeholderTextColor="#999"
                                value={companyName}
                                onChangeText={setCompanyName}
                                editable={!loading}
                            />
                        </View>
                    )}

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>PASSWORD</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                        <Text style={styles.hint}>
                            6+ characters with uppercase, lowercase, and number
                        </Text>
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            loading && styles.signupButtonDisabled,
                        ]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signupButtonText}>Create Account →</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation?.navigate?.("Login")}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Log in here</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
    },
    titleHighlight: {
        color: "#1149C7",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#1149C7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
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
    roleSwitcher: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    roleButtonActive: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6B7280",
    },
    roleButtonTextActive: {
        color: "#1149C7",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: "#6B7280",
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#1F2937",
    },
    hint: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 6,
    },
    signupButton: {
        backgroundColor: "#1149C7",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#1149C7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 56,
        marginTop: 8,
    },
    signupButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
        alignItems: "center",
    },
    loginText: {
        color: "#6B7280",
        fontSize: 14,
    },
    loginLink: {
        color: "#1149C7",
        fontSize: 14,
        fontWeight: "700",
    },
});
