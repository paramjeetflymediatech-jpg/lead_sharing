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

const { height } = Dimensions.get("window");

export default function SignupScreen({ navigation }) {
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
            setError(nameError || companyError || emailError || passwordError);
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

            // Redirect to login after successful registration
            if (data.token || data.id) {
                alert("Account created successfully! Please login.");
                navigation?.navigate?.("Login");
            } else {
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
                {/* Illustration Section */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require("../../assets/signup-illustration.jpg")}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Sign up</Text>
                        <Text style={styles.subtitle}>
                            Create your account and get started
                        </Text>
                    </View>

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

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                           
                            <TextInput
                                style={styles.input}
                                placeholder="abc.xyz@gmail.com"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Full name"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Company Name Input (for Tradesperson) */}
                    {role === "TRADESPERSON" && (
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                            
                                <TextInput
                                    style={styles.input}
                                    placeholder="Company name"
                                    placeholderTextColor="#9CA3AF"
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    )}

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                  
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Terms */}
                    <Text style={styles.terms}>
                        By signing up you agree to our{" "}
                        <Text style={styles.termsLink}>Terms & Conditions</Text>
                    </Text>

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signupButtonText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* OR Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Joined us before? </Text>
                        <TouchableOpacity
                            onPress={() => navigation?.navigate?.("Login")}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Login</Text>
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
        backgroundColor: "#F5F7FA",
    },
    scrollContent: {
        flexGrow: 1,
    },
    illustrationContainer: {
        backgroundColor: "#FFFFFF",
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 40,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    illustration: {
        width: 280,
        height: 120,
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
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "400",
    },
    errorContainer: {
        backgroundColor: "#FEE2E2",
        borderLeftWidth: 4,
        borderLeftColor: "#EF4444",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
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
        backgroundColor: "#2563EB",
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    roleButtonTextActive: {
        color: "#FFFFFF",
    },
    inputContainer: {
        marginBottom: 16,
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
    terms: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 8,
    },
    termsLink: {
        color: "#2563EB",
        fontWeight: "600",
    },
    signupButton: {
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
    },
    signupButtonDisabled: {
        backgroundColor: "#93C5FD",
        shadowOpacity: 0.1,
    },
    signupButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        color: "#9CA3AF",
        fontSize: 13,
        fontWeight: "500",
        marginHorizontal: 12,
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
