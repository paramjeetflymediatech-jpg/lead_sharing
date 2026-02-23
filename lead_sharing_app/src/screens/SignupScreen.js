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
import { Eye, EyeOff } from "lucide-react-native";
import { normalize, hp, wp } from "../utils/responsive";
import { authAPI } from "../services/api";
import SuccessModal from "../components/SuccessModal";
import { useAuth } from "../context/AuthContext";

const { height } = Dimensions.get("window");

export default function SignupScreen({ navigation }) {
    const { login } = useAuth();
    const [role, setRole] = useState("HOMEOWNER");
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [step, setStep] = useState(0); // 0: Form, 1: OTP
    const [registeredUserId, setRegisteredUserId] = useState(null);

    // Validation functions
    const validateName = (value) => {
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
    };

    const validatePhone = (value) => {
        if (!value.trim()) return "Phone number is required";
        if (value.trim().length < 10) return "Enter a valid phone number";
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
        const phoneError = validatePhone(phone);
        const passwordError = validatePassword(password);

        if (nameError || companyError || emailError || phoneError || passwordError) {
            setError(nameError || companyError || emailError || phoneError || passwordError);
            return;
        }

        setLoading(true);

        const body = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
            phone: phone.trim(),
        };

        if (role === "TRADESPERSON") {
            body.companyName = companyName.trim();
        }

        try {
            const data = await authAPI.register(body);

            if (data.id) {
                setRegisteredUserId(data.id);
                // Send OTP immediately after registration
                await authAPI.sendOTP({ phone: phone.trim() }, data.id); // Passing ID if sendOTP needs it
                setStep(1);
            } else {
                navigation?.navigate?.("Login");
            }
        } catch (error) {
            setError(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP() {
        if (otp.length < 6) {
            setError("Please enter 6-digit code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await authAPI.verifyOTP({ otp }, registeredUserId);
            if (data.token) {
                // Auto-login with the new promoted user ID
                await login({
                    token: data.token,
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    name: data.name,
                    verificationStatus: data.verificationStatus || "NOT_STARTED",
                });
            }
            setSuccessModalVisible(true);
        } catch (error) {
            setError(error.message || "Invalid or expired OTP");
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
                    {/* Form Cards based on Step */}
                    {step === 0 ? (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.title}>Sign up</Text>
                                <Text style={styles.subtitle}>
                                    Join AllCarePros as a {role.toLowerCase()}
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

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address (abc.xyz@gmail.com)"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={(text) => setEmail(text.toLowerCase())}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone Number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showPassword ? (
                                            <EyeOff color="#9CA3AF" size={20} />
                                        ) : (
                                            <Eye color="#9CA3AF" size={20} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Terms */}
                            <Text style={styles.terms}>
                                By signing up you agree to our{" "}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate("TermsAndConditions")}
                                >
                                    Terms & Conditions
                                </Text>
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
                        </>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => setStep(0)} style={{ marginBottom: 10 }}>
                                    <Text style={{ color: "#2563EB", fontWeight: "600" }}>← Back to details</Text>
                                </TouchableOpacity>
                                <Text style={styles.title}>Verify Phone</Text>
                                <Text style={styles.subtitle}>
                                    Enter the 6-digit code sent to {phone}
                                </Text>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            {/* OTP Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 24 }]}
                                        placeholder="000000"
                                        placeholderTextColor="#D1D5DB"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        value={otp}
                                        onChangeText={setOtp}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            <Text style={styles.terms}>
                                Didn't receive code?{" "}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => authAPI.sendOTP({ phone: phone.trim() }, registeredUserId)}
                                >
                                    Resend
                                </Text>
                            </Text>

                            <TouchableOpacity
                                style={[styles.signupButton, (loading || otp.length < 6) && styles.signupButtonDisabled]}
                                onPress={handleVerifyOTP}
                                disabled={loading || otp.length < 6}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.signupButtonText}>Verify & Create Account</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

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

            <SuccessModal
                visible={successModalVisible}
                title="Account Created!"
                message="Your account has been successfully created. Please login to continue."
                buttonText="Login Now"
                onClose={() => {
                    setSuccessModalVisible(false);
                    // If we logged in automatically, navigation will handle the screen switch
                    // but we can also navigate to Home explicitly
                    navigation?.navigate?.("Home");
                }}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: "#FFFFFF",
    },
    illustrationContainer: {
        backgroundColor: "#FFFFFF",
        paddingTop: hp(4), // Responsive padding
        paddingBottom: hp(2), // Responsive padding
        paddingHorizontal: wp(5), // Responsive padding
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    illustration: {
        width: wp(60), // Responsive width
        height: hp(15), // Responsive height
    },
    formCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: wp(6), // Responsive padding
        marginTop: -hp(2), // Negative margin
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        marginBottom: hp(2),
    },
    title: {
        fontSize: normalize(24),
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: hp(0.5),
    },
    subtitle: {
        fontSize: normalize(13),
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
        fontSize: normalize(13),
        fontWeight: "500",
    },
    roleSwitcher: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 4,
        marginBottom: hp(2),
    },
    roleButton: {
        flex: 1,
        paddingVertical: hp(1.2),
        borderRadius: 8,
        alignItems: "center",
    },
    roleButtonActive: {
        backgroundColor: "#2563EB",
    },
    roleButtonText: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: "#6B7280",
    },
    roleButtonTextActive: {
        color: "#FFFFFF",
    },
    inputContainer: {
        marginBottom: hp(1.5),
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 16,
        height: hp(6), // Responsive height
    },
    input: {
        flex: 1,
        fontSize: normalize(14),
        color: "#1F2937",
        height: '100%',
    },
    eyeIcon: {
        padding: 10,
    },
    terms: {
        fontSize: normalize(11),
        color: "#6B7280",
        textAlign: "center",
        marginBottom: hp(2),
        marginTop: hp(1),
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
        minHeight: hp(6.5),
    },
    signupButtonDisabled: {
        backgroundColor: "#93C5FD",
        shadowOpacity: 0.1,
    },
    signupButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: hp(2),
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        color: "#9CA3AF",
        fontSize: normalize(12),
        fontWeight: "500",
        marginHorizontal: 12,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: hp(2),
    },
    loginText: {
        color: "#6B7280",
        fontSize: normalize(14),
    },
    loginLink: {
        color: "#2563EB",
        fontSize: normalize(14),
        fontWeight: "700",
    },
});
