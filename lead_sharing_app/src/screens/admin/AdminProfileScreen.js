import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import LogoutModal from "../../components/LogoutModal";
import { normalize, wp, hp } from "../../utils/responsive";

export default function AdminProfileScreen({ onNavigate }) {
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

    const renderMenuItem = (icon, title, subtitle, onPress) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Feather name={icon} size={20} color="#2563EB" />
                </View>
                <View>
                    <Text style={styles.menuItemText}>{title}</Text>
                    {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Profile Card Section */}
            <View style={[styles.header, { paddingTop: hp(1) }]}>
                
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
                                    {user?.name?.charAt(0).toUpperCase() || "A"}
                                </Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{user?.name || "Administrator"}</Text>
                            <Text style={styles.email}>{user?.email || "admin@allcarepros.com"}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => onNavigate("EditProfile")}
                        >
                            <Feather name="edit-2" size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Platform Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform Management</Text>
                {renderMenuItem("settings", "Platform Settings", "Manage global configurations", () => onNavigate("Settings"))}
                {renderMenuItem("bell", "Notification Settings", "Manage push notifications", () => onNavigate("NotificationSettings"))}
                {renderMenuItem("shield", "Security Settings", "Privacy and access control", () => onNavigate("SecuritySettings"))}
                {renderMenuItem("credit-card", "Payment Settings", "Stripe and billing config", () => onNavigate("PaymentSettings"))}
            </View>

            {/* Account Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                {renderMenuItem("user", "Edit Profile", "Update your basic info", () => onNavigate("EditProfile"))}
                {renderMenuItem("lock", "Change Password", "Update your admin credentials", () => onNavigate("ChangePassword"))}
            </View>

            {/* Legal & Help */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Legal & Help</Text>
                {renderMenuItem("file-text", "Privacy Policy", "Review data usage", () => onNavigate("PrivacyPolicy"))}
                {renderMenuItem("shield-off", "Terms & Conditions", "Platform rules and regulations", () => onNavigate("TermsAndConditions"))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0 (Admin Build)</Text>
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
        backgroundColor: "#F8FAFC",
    },
    header: {
        paddingTop: hp(2),
        paddingBottom: hp(2),
        paddingHorizontal: wp(5),
    },
    pageTitle: {
        fontSize: normalize(22),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        width: wp(18),
        height: wp(18),
        borderRadius: wp(9),
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(5),
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: wp(9),
    },
    avatarText: {
        fontSize: normalize(28),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(0.2),
    },
    email: {
        fontSize: normalize(14),
        color: "#64748B",
        marginBottom: hp(0.8),
    },
    editButton: {
        padding: wp(2),
        backgroundColor: "#F8FAFC",
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    roleBadgeText: {
        fontSize: normalize(10),
        fontWeight: "700",
        color: "#2563EB",
    },
    section: {
        marginTop: hp(3),
        paddingHorizontal: wp(5),
    },
    sectionTitle: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: "#94A3B8",
        marginBottom: hp(1.5),
        marginLeft: wp(1),
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: wp(4),
        marginBottom: hp(1.2),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#E2E8F0",
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
        marginRight: wp(4),
    },
    menuItemText: {
        fontSize: normalize(15),
        fontWeight: "600",
        color: "#1E293B",
    },
    menuItemSubtitle: {
        fontSize: normalize(12),
        color: "#64748B",
        marginTop: 2,
    },
    logoutButton: {
        marginTop: hp(4),
        marginHorizontal: wp(5),
        marginBottom: hp(2.5),
        backgroundColor: "#FEF2F2",
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#FEE2E2",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#EF4444",
    },
    versionText: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: normalize(12),
        marginBottom: hp(2.5),
    },
});
