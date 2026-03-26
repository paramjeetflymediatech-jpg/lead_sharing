import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import LogoutModal from "../../components/LogoutModal";
import { normalize, wp, hp } from "../../utils/responsive";
import { Image } from "react-native";

export default function HomeownerProfileTab({ navigation }) {
    const { user, logout } = useAuth();
    const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

    function handleLogout() {
        setLogoutModalVisible(true);
    }

    async function confirmLogout() {
        setLogoutModalVisible(false);
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    const renderMenuItem = (icon, title, onPress, showBorder = true) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                    <Feather name={icon} size={20} color="#4B5563" />
                </View>
                <Text style={styles.menuItemText}>{title}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header / Profile Card */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Profile</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {user?.profile_image || user?.profileImage ? (
                                <Image
                                    source={{ uri: user.profile_image || user.profileImage }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || "H"}
                                </Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{user?.name || "Homeowner"}</Text>
                            <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile")}>
                            <Feather name="edit-2" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Account Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                {renderMenuItem("user", "Edit Profile", () => navigation.navigate("EditProfile"))}
                {renderMenuItem("bell", "Notifications", () => Alert.alert("Notifications", "Notifications screen coming soon"))}
                {renderMenuItem("lock", "Privacy & Security", () => navigation.navigate("PrivacySecurity"), false)}
            </View>

            {/* Support */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                {renderMenuItem("help-circle", "Help Center", () => navigation.navigate("HelpCenter"))}
                {renderMenuItem("mail", "Contact Us", () => navigation.navigate("ContactUs"))}
                {renderMenuItem("file-text", "Terms & Conditions", () => navigation.navigate("TermsAndConditions"), false)}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0</Text>
            <View style={{ height: 40 }} />
            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onLogout={confirmLogout}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
        paddingBottom: hp(2),
        paddingHorizontal: wp(5),
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2.5),
    },
    backButton: {
        marginRight: wp(4),
    },
    pageTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#111827",
    },
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(5),
        padding: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(4),
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: wp(8),
    },
    avatarText: {
        fontSize: normalize(24),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#111827",
        marginBottom: hp(0.2),
    },
    email: {
        fontSize: normalize(13),
        color: "#6B7280",
    },
    editButton: {
        padding: wp(2),
        backgroundColor: "#F9FAFB",
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    section: {
        marginTop: hp(3),
        paddingHorizontal: wp(5),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: "#9CA3AF",
        marginBottom: hp(1.5),
        marginLeft: wp(1),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: wp(4),
        marginBottom: hp(1.5),
        borderRadius: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2.5),
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(3.5),
    },
    menuItemText: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: "#1F2937",
    },
    logoutButton: {
        marginTop: hp(4),
        marginHorizontal: wp(5),
        marginBottom: hp(2.5),
        backgroundColor: "#FEF2F2", // Red-50
        padding: wp(4),
        borderRadius: wp(4),
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    logoutText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#EF4444",
    },
    versionText: {
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: normalize(12),
        marginBottom: hp(2.5),
    },
});
