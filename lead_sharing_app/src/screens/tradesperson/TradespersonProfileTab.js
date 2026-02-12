import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import LogoutModal from "../../components/LogoutModal";

export default function TradespersonProfileTab({ navigation }) {
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
            style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuIconContainer}>
                <Feather name={icon} size={20} color="#4B5563" />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header / Profile Card */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Profile</Text>

                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || "T"}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || "Tradesperson"}</Text>
                            <Text style={styles.userEmail}>{user?.email || "email@example.com"}</Text>
                            <View style={styles.badgeContainer}>
                                <View style={styles.badge}>
                                    <Feather name="shield" size={10} color="#059669" style={{ marginRight: 4 }} />
                                    <Text style={styles.badgeText}>Verified Pro</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile")}>
                            <Feather name="edit-2" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Credits Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Credits & Leads</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem("credit-card", "Buy Credits", () => navigation.navigate("BuyCredits"))}
                    {renderMenuItem("briefcase", "My Leads", () => navigation.navigate("MyLeads"), false)}
                </View>
            </View>

            {/* Account Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem("user", "Edit Profile", () => navigation.navigate("EditProfile"))}
                    {renderMenuItem("bell", "Notifications", () => { })}
                    {renderMenuItem("lock", "Privacy & Security", () => { }, false)}
                </View>
            </View>

            {/* Support */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem("help-circle", "Help Center", () => { })}
                    {renderMenuItem("mail", "Contact Us", () => { })}
                    {renderMenuItem("file-text", "Terms & Conditions", () => { }, false)}
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={20} color="#EF4444" style={{ marginRight: 8 }} />
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
        backgroundColor: "#F3F4F6",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60, // Safe area padding
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 20,
    },
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#EFF6FF", // Blue-50
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2563EB",
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: "row",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5", // Green-50
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#D1FAE5",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#059669",
    },
    editButton: {
        padding: 8,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuGroup: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    menuItemNoBorder: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "500",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: "#FEF2F2", // Red-50
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
    },
    versionText: {
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 12,
        marginBottom: 20,
    },
});
