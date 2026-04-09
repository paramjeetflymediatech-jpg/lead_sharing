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
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { normalize, wp, hp } from "../../utils/responsive";
import { tradespersonAPI, uploadAPI, authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
    { id: "verify", title: "Phone", icon: "smartphone" },
    { id: "docs", title: "Documents", icon: "file-text" },
    { id: "pending", title: "Review", icon: "clock" },
];

export default function OnboardingScreen({ navigation }) {
    const { user, updateUser, login, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);

    // Step 0 — Phone
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+1");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const countries = [
        { label: "CA/US (+1)", value: "+1" },
        { label: "UK (+44)", value: "+44" },
        { label: "AU (+61)", value: "+61" },
        { label: "IN (+91)", value: "+91" },
    ];

    // Step 1 — Documents
    // pendingFiles: local File objects (not yet uploaded)
    // savedDocs:    URLs already in the DB
    const [pendingFiles, setPendingFiles] = useState({ id: null, license: null, insurance: null });
    const [savedDocs, setSavedDocs] = useState({ id: null, license: null, insurance: null });

    // Step 2 — Rejection
    const [rejectionReason, setRejectionReason] = useState("");

    /* ─────────────────── FETCH PROFILE ─────────────────── */

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await tradespersonAPI.getProfile();
            if (res.success) {
                const p = res.data;
                setProfileData(p);
                setPhone(p.phone || "");

                // Sync already-saved docs from DB (do NOT treat as pending)
                setSavedDocs({
                    id: p.idDocument || null,
                    license: p.licenseDocument || null,
                    insurance: p.insuranceDocument || null,
                });

                // Determine step (no annoying alert popups)
                if (p.verificationStatus === "APPROVED") {
                    await updateUser({ verificationStatus: "APPROVED" });
                    return;
                } else if (p.verificationStatus === "REJECTED") {
                    setRejectionReason(p.rejectionReason || "Please correct your documents and re-submit.");
                    setCurrentStep(2);
                } else if (p.verificationStatus === "PENDING_APPROVAL") {
                    setCurrentStep(2);
                } else if (p.idDocument && p.insuranceDocument) {
                    setCurrentStep(2);
                } else if (p.phoneVerified) {
                    setCurrentStep(1);
                }
                // else stay on step 0
            }
        } catch (err) {
            console.log("Fetch profile error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────── STEP 0: OTP ─────────────────── */

    const handleSendOtp = async () => {
        if (!phone) return Alert.alert("Error", "Please enter your phone number");
        const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone}`;
        setLoading(true);
        try {
            await authAPI.sendOTP({ phone: fullPhone });
            setOtpSent(true);
            Alert.alert("Code Sent", "A 6-digit verification code has been sent to your phone.");
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return Alert.alert("Error", "Please enter the 6-digit code");
        setLoading(true);
        try {
            const data = await authAPI.verifyOTP({ otp });
            if (data.token) {
                await login({
                    token: data.token,
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    name: data.name,
                    phone: data.phone,
                    verificationStatus: data.verificationStatus || "NOT_STARTED",
                });
            } else {
                await updateUser({ phoneVerified: true, phone: data.phone });
            }
            setCurrentStep(1);
        } catch (err) {
            Alert.alert("Error", "Invalid verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────── STEP 1: PICK FILES (LOCAL ONLY) ─────────────────── */

    const handlePickDocument = (type) => {
        Alert.alert(
            "Select Document",
            "Choose how to upload your document",
            [
                { text: "📷 Take Photo", onPress: () => pickImage(type, "camera") },
                { text: "🖼 Choose from Gallery", onPress: () => pickImage(type, "gallery") },
                { text: "📄 Upload PDF/Doc", onPress: () => pickDocument(type) },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const pickImage = async (type, source) => {
        let result;
        if (source === "camera") {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") return Alert.alert("Permission Required", "Camera access is needed");
            result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") return Alert.alert("Permission Required", "Gallery access is needed");
            result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
        }

        if (!result.canceled) {
            const asset = result.assets[0];
            if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                return Alert.alert("File Too Large", "Maximum image size is 5MB");
            }
            // ✅ Store locally — no upload yet
            setPendingFiles(prev => ({
                ...prev,
                [type]: { uri: asset.uri, name: `${type}.jpg`, type: "image/jpeg", isImage: true }
            }));
        }
    };

    const pickDocument = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                if (asset.size > 10 * 1024 * 1024) {
                    return Alert.alert("File Too Large", "Maximum document size is 10MB");
                }
                // ✅ Store locally — no upload yet
                setPendingFiles(prev => ({
                    ...prev,
                    [type]: { uri: asset.uri, name: asset.name, type: asset.mimeType, isImage: false }
                }));
            }
        } catch (err) {
            console.log("Document picker error:", err);
            Alert.alert("Error", "Could not open document picker");
        }
    };

    /* ─────────────────── STEP 1: SUBMIT (UPLOAD + SAVE) ─────────────────── */

    const submitDocuments = async () => {
        const hasId = pendingFiles.id || savedDocs.id;
        const hasInsurance = pendingFiles.insurance || savedDocs.insurance;

        if (!hasId) return Alert.alert("Required", "Please upload your Government ID");
        if (!hasInsurance) return Alert.alert("Required", "Please upload your Insurance Certificate");

        setLoading(true);
        try {
            // Upload each pending file to the server NOW
            const uploadFile = async (fileObj) => {
                if (!fileObj) return null;
                const result = await uploadAPI.uploadImage(fileObj);
                return result.url;
            };

            const idUrl = pendingFiles.id ? await uploadFile(pendingFiles.id) : savedDocs.id;
            const insuranceUrl = pendingFiles.insurance ? await uploadFile(pendingFiles.insurance) : savedDocs.insurance;
            const licenseUrl = pendingFiles.license ? await uploadFile(pendingFiles.license) : savedDocs.license;

            // Save to database
            await tradespersonAPI.updateProfile({
                idDocument: idUrl,
                insuranceDocument: insuranceUrl,
                licenseDocument: licenseUrl,
                verificationStatus: "PENDING_APPROVAL",
            });

            await updateUser({ verificationStatus: "PENDING_APPROVAL" });

            // Clear pending
            setPendingFiles({ id: null, license: null, insurance: null });
            setSavedDocs({ id: idUrl, license: licenseUrl, insurance: insuranceUrl });

            setCurrentStep(2);
        } catch (err) {
            console.log("Submit error:", err);
            Alert.alert("Error", "Failed to upload documents. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────── STEP 2: RE-SUBMIT ─────────────────── */

    const handleReSubmit = async () => {
        setLoading(true);
        try {
            await tradespersonAPI.updateProfile({ verificationStatus: "NOT_STARTED" });
            setRejectionReason("");
            setPendingFiles({ id: null, license: null, insurance: null });
            setSavedDocs({ id: null, license: null, insurance: null });
            setCurrentStep(1);
        } catch (err) {
            Alert.alert("Error", "Failed to reset. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────── HELPERS ─────────────────── */

    const getDocState = (type) => {
        if (pendingFiles[type]) return "pending";   // locally selected
        if (savedDocs[type]) return "saved";     // in DB
        return "empty";
    };

    const getDocLabel = (type, defaultLabel) => {
        if (pendingFiles[type]) {
            const name = pendingFiles[type].name || "";
            return name.length > 28 ? name.substring(0, 25) + "..." : name;
        }
        if (savedDocs[type]) return "✓ Already uploaded";
        return defaultLabel;
    };

    /* ─────────────────── RENDER ─────────────────── */

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* HEADER */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Account Setup</Text>
                            <Text style={styles.headerSubtitle}>Complete all steps to activate your account</Text>
                        </View>
                        <TouchableOpacity onPress={logout} style={{ padding: 8, marginTop: -4 }}>
                            <Feather name="log-out" size={normalize(20)} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* STEPPER */}
                <View style={styles.stepperContainer}>
                    {STEPS.map((step, idx) => (
                        <View key={step.id} style={styles.stepWrapper}>
                            <View style={[
                                styles.stepIcon,
                                currentStep === idx && styles.stepIconActive,
                                currentStep > idx && styles.stepIconDone,
                            ]}>
                                <Feather
                                    name={currentStep > idx ? "check" : step.icon}
                                    size={normalize(18)}
                                    color={currentStep >= idx ? "#FFF" : "#9CA3AF"}
                                />
                            </View>
                            <Text style={[styles.stepLabel, currentStep === idx && { color: "#2563EB" }]}>
                                {step.title}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.content}>

                    {/* ══════ STEP 0: Phone Verification ══════ */}
                    {currentStep === 0 && (
                        <View style={styles.card}>
                            <View style={styles.iconCircle}>
                                <Feather name="smartphone" size={normalize(32)} color="#2563EB" />
                            </View>
                            <Text style={styles.cardTitle}>Verify Phone Number</Text>
                            <Text style={styles.cardDesc}>
                                We'll send a 6-digit code to confirm your contact details.
                            </Text>

                            {!otpSent ? (
                                <>
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={countryCode}
                                            style={styles.picker}
                                            onValueChange={(val) => setCountryCode(val)}
                                        >
                                            {countries.map(c => (
                                                <Picker.Item key={c.value} label={c.label} value={c.value} />
                                            ))}
                                        </Picker>
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <Feather name="phone" size={normalize(20)} color="#9CA3AF" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Phone number"
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={setPhone}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={handleSendOtp} disabled={loading || !phone}>
                                        <LinearGradient
                                            colors={phone ? ["#2563EB", "#1D4ED8"] : ["#9CA3AF", "#9CA3AF"]}
                                            style={styles.primaryButton}
                                        >
                                            {loading
                                                ? <ActivityIndicator color="#FFF" />
                                                : <Text style={styles.buttonText}>Send Verification Code</Text>
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputWrapper}>
                                        <Feather name="lock" size={normalize(20)} color="#9CA3AF" />
                                        <TextInput
                                            style={[styles.input, { letterSpacing: 6, textAlign: "center" }]}
                                            placeholder="000000"
                                            keyboardType="numeric"
                                            maxLength={6}
                                            value={otp}
                                            onChangeText={setOtp}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={handleVerifyOtp} disabled={loading || otp.length < 6}>
                                        <LinearGradient
                                            colors={otp.length === 6 ? ["#2563EB", "#1D4ED8"] : ["#9CA3AF", "#9CA3AF"]}
                                            style={styles.primaryButton}
                                        >
                                            {loading
                                                ? <ActivityIndicator color="#FFF" />
                                                : <Text style={styles.buttonText}>Verify & Continue</Text>
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ alignItems: "center", marginTop: 14 }}
                                        onPress={() => { setOtpSent(false); setOtp(""); }}
                                    >
                                        <Text style={styles.linkText}>Use a different number</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {/* ══════ STEP 1: Document Upload ══════ */}
                    {currentStep === 1 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Upload Documents</Text>
                            <Text style={styles.cardDesc}>
                                Select your files below. They will be uploaded when you tap "Submit Documents".
                            </Text>

                            {[
                                { id: "id", label: "Government ID *", subtitle: "License / Passport" },
                                { id: "insurance", label: "Insurance Certificate *", subtitle: "Liability insurance" },
                                { id: "license", label: "Trade License", subtitle: "Optional" },
                            ].map((doc) => {
                                const state = getDocState(doc.id);
                                const isPending = state === "pending";
                                const isSaved = state === "saved";

                                return (
                                    <TouchableOpacity
                                        key={doc.id}
                                        style={[
                                            styles.uploadBox,
                                            isSaved && styles.uploadBoxSaved,
                                            isPending && styles.uploadBoxPending,
                                        ]}
                                        onPress={() => handlePickDocument(doc.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.uploadInfo}>
                                            <View style={[
                                                styles.uploadIconCircle,
                                                isSaved && { backgroundColor: "#D1FAE5" },
                                                isPending && { backgroundColor: "#FEF3C7" },
                                            ]}>
                                                <Feather
                                                    name={isSaved ? "check-circle" : isPending ? "file" : "upload"}
                                                    size={normalize(20)}
                                                    color={isSaved ? "#10B981" : isPending ? "#D97706" : "#2563EB"}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.uploadLabel}>{doc.label}</Text>
                                                <Text style={styles.uploadSub} numberOfLines={1}>
                                                    {getDocLabel(doc.id, doc.subtitle)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Badge */}
                                        <View style={[
                                            styles.badge,
                                            isSaved && { backgroundColor: "#D1FAE5" },
                                            isPending && { backgroundColor: "#FEF3C7" },
                                        ]}>
                                            <Text style={[
                                                styles.badgeText,
                                                isSaved && { color: "#059669" },
                                                isPending && { color: "#D97706" },
                                            ]}>
                                                {isSaved ? "Saved" : isPending ? "Ready" : "Tap to add"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Info banner */}
                            <View style={styles.infoBanner}>
                                <Feather name="info" size={normalize(14)} color="#3B82F6" style={{ marginTop: 1 }} />
                                <Text style={styles.infoText}>
                                    Files are uploaded only when you tap "Submit Documents"
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={submitDocuments}
                                disabled={loading || (
                                    !(pendingFiles.id || savedDocs.id) ||
                                    !(pendingFiles.insurance || savedDocs.insurance)
                                )}
                                style={{ marginTop: 8 }}
                            >
                                <LinearGradient
                                    colors={
                                        (pendingFiles.id || savedDocs.id) && (pendingFiles.insurance || savedDocs.insurance)
                                            ? ["#2563EB", "#1D4ED8"]
                                            : ["#9CA3AF", "#9CA3AF"]
                                    }
                                    style={styles.primaryButton}
                                >
                                    {loading
                                        ? <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                            <ActivityIndicator color="#FFF" />
                                            <Text style={styles.buttonText}>Uploading & Saving...</Text>
                                        </View>
                                        : <Text style={styles.buttonText}>Submit Documents</Text>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ══════ STEP 2: Pending / Rejected ══════ */}
                    {currentStep === 2 && (
                        <View style={[styles.card, { alignItems: "center" }]}>
                            {rejectionReason ? (
                                <>
                                    <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
                                        <Feather name="x-circle" size={normalize(40)} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.cardTitle, { color: "#EF4444", textAlign: "center" }]}>
                                        Verification Rejected
                                    </Text>
                                    <Text style={[styles.cardDesc, { textAlign: "center" }]}>
                                        Your application was not successful. Please review the reason below and re-submit.
                                    </Text>

                                    <View style={styles.rejectionBox}>
                                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                            <Feather name="alert-circle" size={normalize(16)} color="#991B1B" style={{ marginTop: 2, marginRight: 8 }} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.rejectionLabel}>Reason:</Text>
                                                <Text style={styles.rejectionText}>"{rejectionReason}"</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleReSubmit}
                                        disabled={loading}
                                        style={{ width: "100%", marginTop: hp(2) }}
                                    >
                                        <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.primaryButton}>
                                            {loading
                                                ? <ActivityIndicator color="#FFF" />
                                                : <Text style={styles.buttonText}>Fix & Re-submit Documents</Text>
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={fetchProfile} style={{ marginTop: 16 }}>
                                        <Text style={styles.linkText}>Refresh Status</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
                                        <Feather name="clock" size={normalize(40)} color="#F59E0B" />
                                    </View>
                                    <Text style={[styles.cardTitle, { textAlign: "center" }]}>Under Review</Text>
                                    <Text style={[styles.cardDesc, { textAlign: "center" }]}>
                                        Your application is being reviewed by our team. This usually takes 24–48 hours.
                                    </Text>

                                    <View style={styles.infoBanner}>
                                        <Feather name="mail" size={normalize(14)} color="#3B82F6" style={{ marginTop: 1 }} />
                                        <Text style={styles.infoText}>
                                            We'll email you at <Text style={{ fontWeight: "bold" }}>{user?.email}</Text> once reviewed.
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={fetchProfile}
                                        disabled={loading}
                                        style={{ width: "100%", marginTop: hp(2) }}
                                    >
                                        <LinearGradient colors={["#2563EB", "#1D4ED8"]} style={styles.primaryButton}>
                                            {loading
                                                ? <ActivityIndicator color="#FFF" />
                                                : <Text style={styles.buttonText}>Refresh Status</Text>
                                            }
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

/* ══════════════════════ STYLES ══════════════════════ */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },

    header: {
        paddingHorizontal: wp(6),
        paddingTop: hp(4),
        paddingBottom: hp(2),
    },
    headerTitle: { fontSize: normalize(28), fontWeight: "900", color: "#111827" },
    headerSubtitle: { fontSize: normalize(14), color: "#6B7280", marginTop: 4 },

    stepperContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: hp(2),
        paddingHorizontal: wp(4),
    },
    stepWrapper: { alignItems: "center" },
    stepIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#E5E7EB",
        alignItems: "center", justifyContent: "center",
    },
    stepIconActive: { backgroundColor: "#2563EB" },
    stepIconDone: { backgroundColor: "#10B981" },
    stepLabel: {
        marginTop: 6,
        fontSize: normalize(11),
        fontWeight: "700",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    content: { paddingHorizontal: wp(5), paddingBottom: hp(6) },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        padding: wp(6),
        elevation: 6,
        shadowColor: "#1149C7",
        shadowOpacity: 0.07,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },

    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: "#EFF6FF",
        alignItems: "center", justifyContent: "center",
        alignSelf: "center",
        marginBottom: hp(2),
    },

    cardTitle: { fontSize: normalize(22), fontWeight: "800", color: "#111827" },
    cardDesc: { fontSize: normalize(14), color: "#6B7280", marginTop: hp(1), marginBottom: hp(2.5),   },

    pickerWrapper: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: hp(1.5),
        overflow: "hidden",
    },
    picker: { height: hp(7) },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: hp(7),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: hp(2),
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#111827",
    },

    primaryButton: {
        borderRadius: 14,
        height: hp(7),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    buttonText: { color: "#FFF", fontSize: normalize(15), fontWeight: "700" },

    linkText: { color: "#2563EB", fontWeight: "700", fontSize: normalize(14) },

    // Document upload boxes
    uploadBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        borderStyle: "dashed",
        borderRadius: 16,
        padding: wp(4),
        marginBottom: hp(1.5),
        backgroundColor: "#FAFAFA",
    },
    uploadBoxSaved: { borderColor: "#10B981", backgroundColor: "#F0FDF4", borderStyle: "solid" },
    uploadBoxPending: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB", borderStyle: "solid" },

    uploadInfo: { flexDirection: "row", alignItems: "center", flex: 1 },

    uploadIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#EFF6FF",
        alignItems: "center", justifyContent: "center",
    },

    uploadLabel: { fontSize: normalize(13), fontWeight: "700", color: "#374151" },
    uploadSub: { fontSize: normalize(11), color: "#9CA3AF", marginTop: 2 },

    badge: {
        backgroundColor: "#F3F4F6",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginLeft: 8,
    },
    badgeText: { fontSize: normalize(10), fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },

    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EFF6FF",
        borderRadius: 10,
        padding: 12,
        marginVertical: hp(1.5),
        gap: 8,
    },
    infoText: { flex: 1, fontSize: normalize(12), color: "#1D4ED8"},

    // Rejection
    rejectionBox: {
        backgroundColor: "#FEF2F2",
        borderRadius: 14,
        padding: 16,
        width: "100%",
        borderWidth: 1,
        borderColor: "#FEE2E2",
        marginBottom: 8,
    },
    rejectionLabel: { fontSize: normalize(12), fontWeight: "800", color: "#7F1D1D", marginBottom: 4, textTransform: "uppercase" },
    rejectionText: { fontSize: normalize(14), color: "#991B1B", fontStyle: "italic", },
});