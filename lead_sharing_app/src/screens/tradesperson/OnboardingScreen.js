import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { normalize, wp, hp } from "../../utils/responsive";
import { tradespersonAPI, uploadAPI, authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
    { id: "verify", title: "Phone", icon: "smartphone" },
    { id: "docs", title: "Verify", icon: "file-text" },
    { id: "bank", title: "Bank", icon: "credit-card" },
    { id: "pending", title: "Final", icon: "clock" },
];

export default function OnboardingScreen({ navigation }) {
    const { user, updateUser, login, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [docs, setDocs] = useState({
        id: null,
        license: null,
        insurance: null,
        profileImage: null,
    });
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        console.log("[Onboarding] Fetching profile...");
        setLoading(true);
        try {
            const res = await tradespersonAPI.getProfile();
            console.log("[Onboarding] Profile Response:", JSON.stringify(res));
            if (res.success) {
                const profile = res.data;
                console.log("[Onboarding] Verification Status:", profile.verificationStatus);

                setPhone(profile.phone || "");

                if (profile.verificationStatus === "REJECTED") {
                    setRejectionReason(profile.rejectionReason || "Please verify your documents.");
                    setCurrentStep(3);
                } else if (profile.verificationStatus === "APPROVED") {
                    console.log("[Onboarding] Status is APPROVED, updating user state...");
                    Alert.alert("Status Approved", "Your account is approved! Redirecting...");
                    await updateUser({ verificationStatus: "APPROVED" });
                    console.log("[Onboarding] User state updated, attempting navigation...");
                    // Explicitly navigate if the context update doesn't trigger it fast enough
                    navigation.replace("TradespersonDashboard");
                } else if (profile.verificationStatus === "PENDING_APPROVAL") {
                    Alert.alert("Status", "Current status: " + profile.verificationStatus);
                    setCurrentStep(3);
                } else {
                    Alert.alert("Status", "Current status: " + (profile.verificationStatus || "NOT_STARTED"));
                }

                // Sync existing docs if any
                setDocs({
                    id: profile.idDocument || null,
                    license: profile.licenseDocument || null,
                    insurance: profile.insuranceDocument || null,
                    profileImage: profile.profileImage || null,
                });

                if (profile.payoutsEnabled) {
                    setCurrentStep(3);
                } else if (profile.idDocument && profile.insuranceDocument && profile.licenseDocument) {
                    setCurrentStep(2);
                } else if (profile.phoneVerified) {
                    setCurrentStep(1);
                }
            }
        } catch (err) {
            console.log("Fetch profile error:", err);
            Alert.alert("Connection Error", "Could not fetch profile: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- OTP ---------------- */

    const handleSendOtp = async () => {
        if (!phone) return Alert.alert("Error", "Enter phone number");
        setLoading(true);
        try {
            await authAPI.sendOTP({ phone });
            setOtpSent(true);
            Alert.alert("Success", "Verification code sent!");
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6)
            return Alert.alert("Error", "Enter 6-digit verification code");

        setLoading(true);
        try {
            const data = await authAPI.verifyOTP({ otp });
            if (data.token) {
                // Refresh local session with the new promoted user ID
                await login({
                    token: data.token,
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    name: data.name,
                    verificationStatus: data.verificationStatus || "NOT_STARTED",
                });
            } else {
                await updateUser({ phoneVerified: true });
            }
            setCurrentStep(1);
        } catch (err) {
            Alert.alert("Error", "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Upload ---------------- */

    const handleDocumentUpload = async (type) => {
        Alert.alert(
            "Select Source",
            "How would you like to upload your document?",
            [
                { text: "Take Photo", onPress: () => pickImage(type, "camera") },
                { text: "Choose from Gallery", onPress: () => pickImage(type, "gallery") },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const pickImage = async (type, source) => {
        let result;

        if (source === "camera") {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                return Alert.alert("Permission Required", "Camera access needed");
            }
            result = await ImagePicker.launchCameraAsync({
                quality: 0.7,
                allowsEditing: true,
            });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                return Alert.alert("Permission Required", "Gallery access needed");
            }
            result = await ImagePicker.launchImageLibraryAsync({
                quality: 0.7,
                allowsEditing: true,
            });
        }

        if (!result.canceled) {
            setLoading(true);
            try {
                const imageFile = {
                    uri: result.assets[0].uri,
                    name: `${type}.jpg`,
                    type: "image/jpeg",
                };

                const uploadResult = await uploadAPI.uploadImage(imageFile);
                setDocs((prev) => ({ ...prev, [type]: uploadResult.url }));
            } catch (err) {
                Alert.alert("Upload Error", "Failed to upload image");
            } finally {
                setLoading(false);
            }
        }
    };

    /* ---------------- Next Step ---------------- */

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!docs.id || !docs.insurance || !docs.license)
                return Alert.alert("Required", "Upload all required documents (ID, License, Insurance)");

            setLoading(true);
            try {
                await tradespersonAPI.updateProfile({
                    idDocument: docs.id,
                    licenseDocument: docs.license,
                    insuranceDocument: docs.insurance,
                    profileImage: docs.profileImage, // Include profile image if uploaded
                    verificationStatus: "PENDING_APPROVAL",
                });

                await updateUser({ verificationStatus: "PENDING_APPROVAL" });
                setCurrentStep(2);
            } catch (err) {
                Alert.alert("Error", "Failed to save documents");
            } finally {
                setLoading(false);
            }
        } else if (currentStep === 2) {
            setLoading(true);
            try {
                await tradespersonAPI.updateProfile({
                    verificationStatus: "PENDING_APPROVAL",
                });

                await updateUser({ verificationStatus: "PENDING_APPROVAL" });
                setRejectionReason("");
                setCurrentStep(3);
            } catch (err) {
                Alert.alert("Error", "Submission failed");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReSubmit = async () => {
        setLoading(true);
        try {
            await tradespersonAPI.updateProfile({
                verificationStatus: "NOT_STARTED",
            });
            setRejectionReason("");
            setCurrentStep(1);
        } catch (err) {
            Alert.alert("Error", "Failed to reset status");
        } finally {
            setLoading(false);
        }
    };

    /* ================================================= */

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Account Setup</Text>
                            <Text style={styles.headerSubtitle}>
                                Complete all steps to activate your trades account
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={logout}
                            style={{ padding: 8, marginTop: -5 }}
                        >
                            <Feather name="log-out" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* STEPPER */}
                <View style={styles.stepperContainer}>
                    {STEPS.map((step, idx) => (
                        <View key={step.id} style={styles.stepWrapper}>
                            <View
                                style={[
                                    styles.stepIcon,
                                    currentStep === idx && styles.stepIconActive,
                                    currentStep > idx && styles.stepIconDone,
                                ]}
                            >
                                <Feather
                                    name={currentStep > idx ? "check" : step.icon}
                                    size={18}
                                    color={currentStep >= idx ? "#FFF" : "#9CA3AF"}
                                />
                            </View>
                            <Text style={styles.stepLabel}>{step.title}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.content}>
                    {/* STEP 0 */}
                    {currentStep === 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Phone Verification</Text>
                            <Text style={styles.cardDesc}>
                                We’ll send you a secure login code.
                            </Text>

                            <View style={styles.inputWrapper}>
                                <Feather
                                    name={otpSent ? "lock" : "phone"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder={
                                        otpSent
                                            ? "Enter 6-digit Code"
                                            : "Enter Phone Number"
                                    }
                                    keyboardType={otpSent ? "numeric" : "phone-pad"}
                                    maxLength={otpSent ? 6 : undefined}
                                    value={otpSent ? otp : phone}
                                    onChangeText={otpSent ? setOtp : setPhone}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={["#2563EB", "#1D4ED8"]}
                                    style={styles.primaryButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>
                                            {otpSent ? "Verify & Continue" : "Send OTP"}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>
                                Account Setup
                            </Text>


                            <View style={styles.divider} />

                            <Text style={styles.sectionTitle}>
                                Verification Documents
                            </Text>

                            {[
                                { id: "id", label: "Government ID" },
                                { id: "license", label: "Trade License" },
                                { id: "insurance", label: "Insurance Certificate" },
                            ].map((doc) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    style={[
                                        styles.uploadBox,
                                        docs[doc.id] && styles.uploadBoxDone,
                                    ]}
                                    onPress={() => handleDocumentUpload(doc.id)}
                                >
                                    <View style={styles.uploadInfo}>
                                        <Feather
                                            name={docs[doc.id] ? "check-circle" : "camera"}
                                            size={22}
                                            color={docs[doc.id] ? "#10B981" : "#2563EB"}
                                        />
                                        <Text style={styles.uploadLabel}>
                                            {doc.label}
                                        </Text>
                                    </View>

                                    {docs[doc.id] && (
                                        <Image
                                            source={{ uri: docs[doc.id] }}
                                            style={styles.previewThumb}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                onPress={handleNext}
                                disabled={!docs.id || !docs.insurance || !docs.license}
                            >
                                <LinearGradient
                                    colors={
                                        docs.id && docs.insurance && docs.license
                                            ? ["#2563EB", "#1D4ED8"]
                                            : ["#9CA3AF", "#9CA3AF"]
                                    }
                                    style={styles.primaryButton}
                                >
                                    <Text style={styles.buttonText}>
                                        Submit Documents
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <View style={styles.card}>
                            <View style={styles.iconCircle}>
                                <Feather
                                    name="credit-card"
                                    size={32}
                                    color="#2563EB"
                                />
                            </View>

                            <Text style={styles.cardTitle}>
                                Connect Bank Account
                            </Text>

                            <Text style={styles.cardDesc}>
                                Secure payouts powered by Stripe.
                            </Text>

                            <TouchableOpacity style={styles.stripeButton}>
                                <Text style={styles.stripeText}>
                                    Setup with Stripe
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={handleNext}
                            >
                                <Text style={styles.skipText}>
                                    Skip for Now & Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                        <View style={[styles.card, { alignItems: "center" }]}>
                            {rejectionReason ? (
                                <>
                                    <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
                                        <Feather name="x-circle" size={44} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.cardTitle, { color: "#EF4444" }]}>
                                        Verification Rejected
                                    </Text>
                                    <Text style={[styles.cardDesc, { textAlign: "center" }]}>
                                        Unfortunately, your verification was not successful.
                                    </Text>

                                    <View style={styles.rejectionBox}>
                                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                            <Feather name="alert-circle" size={18} color="#991B1B" style={{ marginTop: 2, marginRight: 8 }} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.rejectionLabel}>Reason for Rejection:</Text>
                                                <Text style={styles.rejectionText}>"{rejectionReason}"</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleReSubmit}
                                        disabled={loading}
                                        style={{ width: "100%", marginTop: hp(2) }}
                                    >
                                        <LinearGradient
                                            colors={["#EF4444", "#DC2626"]}
                                            style={styles.primaryButton}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#FFF" />
                                            ) : (
                                                <Text style={styles.buttonText}>Fix & Re-submit</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={fetchProfile}
                                        style={{ marginTop: 15 }}
                                    >
                                        <Text style={styles.skipText}>Check Verification Status</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.iconCircle}>
                                        <Feather name="clock" size={40} color="#F59E0B" />
                                    </View>

                                    <Text style={styles.cardTitle}>
                                        Application Submitted!
                                    </Text>

                                    <Text style={[styles.cardDesc, { textAlign: "center" }]}>
                                        Our team will review your documents within 48 hours.
                                    </Text>

                                    <TouchableOpacity
                                        onPress={fetchProfile}
                                        style={{ width: "100%" }}
                                    >
                                        <LinearGradient
                                            colors={["#2563EB", "#1D4ED8"]}
                                            style={styles.primaryButton}
                                        >
                                            <Text style={styles.buttonText}>
                                                Refresh Status
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },

    header: {
        paddingHorizontal: wp(6),
        paddingTop: hp(5),
        paddingBottom: hp(2),
    },

    headerTitle: {
        fontSize: normalize(30),
        fontWeight: "900",
        color: "#111827",
    },

    headerSubtitle: {
        fontSize: normalize(15),
        color: "#6B7280",
        marginTop: 6,
    },

    stepperContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: hp(2),
    },

    stepWrapper: { alignItems: "center" },

    stepIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },

    stepIconActive: { backgroundColor: "#2563EB" },
    stepIconDone: { backgroundColor: "#10B981" },

    stepLabel: {
        marginTop: 6,
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#6B7280",
    },

    content: { paddingHorizontal: wp(6), paddingBottom: hp(5) },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        padding: wp(6),
        elevation: 6,
    },

    cardTitle: {
        fontSize: normalize(22),
        fontWeight: "800",
        color: "#111827",
    },

    cardDesc: {
        fontSize: normalize(15),
        color: "#6B7280",
        marginVertical: hp(2),
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: hp(7),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: hp(2.5),
    },

    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: normalize(16),
        fontWeight: "600",
    },

    primaryButton: {
        borderRadius: 14,
        height: hp(7),
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "#FFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },

    uploadBox: {
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        borderStyle: "dashed",
        borderRadius: 18,
        padding: wp(4),
        marginBottom: hp(2),
        backgroundColor: "#FAFAFA",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    uploadBoxDone: {
        borderColor: "#10B981",
        backgroundColor: "#F0FDF4",
    },
    profileUpload: {
        alignItems: "center",
        marginBottom: 20,
    },
    profilePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        position: "relative",
    },
    profilePreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#2563EB",
    },
    profileLabel: {
        marginTop: 8,
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "600",
    },
    addIconBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#2563EB",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        width: "100%",
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: "Outfit-Bold",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 10,
    },
    uploadInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    uploadLabel: {
        marginLeft: 12,
        fontWeight: "700",
        fontSize: normalize(14),
        color: "#374151",
    },

    previewThumb: {
        width: 55,
        height: 55,
        borderRadius: 10,
    },

    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: hp(2),
    },

    stripeButton: {
        backgroundColor: "#000",
        borderRadius: 14,
        height: hp(7),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(2),
    },

    stripeText: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: normalize(16),
    },

    skipButton: { alignItems: "center", paddingVertical: 10 },

    skipText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: normalize(14),
    },
    rejectionBox: {
        backgroundColor: "#FEF2F2",
        borderRadius: 16,
        padding: 16,
        width: "100%",
        borderWidth: 1,
        borderColor: "#FEE2E2",
        marginBottom: 5,
    },
    rejectionLabel: {
        fontSize: normalize(14),
        fontWeight: "800",
        color: "#7F1D1D",
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: normalize(14),
        color: "#991B1B",
        fontStyle: "italic",
        lineHeight: 20,
    },
});