import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import LogoutModal from "../../components/LogoutModal";
import { normalize, wp, hp } from "../../utils/responsive";
import { Image } from "react-native";

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
                                    {user?.name?.charAt(0).toUpperCase() || "T"}
                                </Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || "Tradesperson"}</Text>
                            <Text style={styles.userEmail}>{user?.email || "email@example.com"}</Text>
                            {(user?.phone || user?.phone_number) && (
                                <Text style={styles.userPhone}>
                                    <Feather name="phone" size={12} color="#6B7280" /> {user?.phone || user?.phone_number}
                                </Text>
                            )}
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
        padding: wp(5),
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
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: "#EFF6FF", // Blue-50
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(4),
        borderWidth: 1,
        borderWidth: 1,
        borderColor: "#DBEAFE",
        overflow: "hidden", // Added to clip image
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: wp(8),
    },
    avatarText: {
        fontSize: normalize(24),
        fontWeight: "700",
        color: "#2563EB",
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#111827",
        marginBottom: hp(0.5),
    },
    userEmail: {
        fontSize: normalize(14),
        color: "#6B7280",
        marginBottom: hp(0.5),
    },
    userPhone: {
        fontSize: normalize(14),
        color: "#6B7280",
        marginBottom: hp(1),
    },
    badgeContainer: {
        flexDirection: "row",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5", // Green-50
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.5),
        borderRadius: wp(25),
        borderWidth: 1,
        borderColor: "#D1FAE5",
    },
    badgeText: {
        fontSize: normalize(11),
        fontWeight: "600",
        color: "#059669",
    },
    editButton: {
        padding: wp(2),
        backgroundColor: "#F9FAFB",
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    section: {
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: hp(1.5),
        marginLeft: wp(1),
    },
    menuGroup: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
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
        padding: wp(4),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    menuItemNoBorder: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(2.5),
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp(3.5),
    },
    menuText: {
        flex: 1,
        fontSize: normalize(16),
        color: "#1F2937",
        fontWeight: "500",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
