import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function HomeownerProfileTab({ navigation }) {
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>

            {/* User Info Card */}
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || "H"}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name || "Homeowner"}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate("EditProfile")}
                >
                    <Text style={styles.menuIcon}>✏️</Text>
                    <Text style={styles.menuText}>Edit Profile</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>🔔</Text>
                    <Text style={styles.menuText}>Notifications</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>🔒</Text>
                    <Text style={styles.menuText}>Privacy & Security</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>❓</Text>
                    <Text style={styles.menuText}>Help Center</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📧</Text>
                    <Text style={styles.menuText}>Contact Us</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📄</Text>
                    <Text style={styles.menuText}>Terms & Conditions</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatar: {
        fontSize: 32,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#6B7280",
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    menuItem: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        color: "#1F2937",
    },
    menuArrow: {
        fontSize: 18,
        color: "#9CA3AF",
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
});
