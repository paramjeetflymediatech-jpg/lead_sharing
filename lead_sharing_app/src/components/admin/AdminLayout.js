import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Alert,
    SafeAreaView,
    Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({
    children,
    activeScreen,
    onScreenChange,
    refreshControl,
    onCreatePress,
}) {
    const { user, logout } = useAuth();
    const [menuVisible, setMenuVisible] = React.useState(false);

    function handleMenuPress(screen) {
        setMenuVisible(false);

        if (screen === "Sign Out") {
            handleLogout();
        } else {
            onScreenChange(screen);
        }
    }

    function handleLogout() {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        console.error("Logout error:", error);
                    }
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <View style={styles.menuIcon}>
                        <View style={styles.menuLine} />
                        <View style={styles.menuLine} />
                        <View style={styles.menuLine} />
                    </View>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{activeScreen}</Text>
                    <Text style={styles.headerSubtitle}>Admin Panel</Text>
                </View>

                <View style={styles.headerRight}>
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0) || "A"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    refreshControl={refreshControl}
                >
                    {children}
                </ScrollView>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleMenuPress("Dashboard")}
                >
                    <Text
                        style={
                            activeScreen === "Dashboard"
                                ? styles.navIconActive
                                : styles.navIcon
                        }
                    >
                        🏠
                    </Text>
                    <Text
                        style={
                            activeScreen === "Dashboard"
                                ? styles.navLabelActive
                                : styles.navLabel
                        }
                    >
                        Dashboard
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleMenuPress("Users")}
                >
                    <Text
                        style={
                            activeScreen === "Users" ? styles.navIconActive : styles.navIcon
                        }
                    >
                        👥
                    </Text>
                    <Text
                        style={
                            activeScreen === "Users"
                                ? styles.navLabelActive
                                : styles.navLabel
                        }
                    >
                        Users
                    </Text>
                </TouchableOpacity>

                {/* Center Create Button */}
                {onCreatePress && (
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={onCreatePress}
                    >
                        <View style={styles.centerButtonInner}>
                            <Text style={styles.centerButtonIcon}>+</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleMenuPress("Jobs")}
                >
                    <Text
                        style={
                            activeScreen === "Jobs" ? styles.navIconActive : styles.navIcon
                        }
                    >
                        🏗️
                    </Text>
                    <Text
                        style={
                            activeScreen === "Jobs" ? styles.navLabelActive : styles.navLabel
                        }
                    >
                        Jobs
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleMenuPress("Settings")}
                >
                    <Text
                        style={
                            activeScreen === "Settings"
                                ? styles.navIconActive
                                : styles.navIcon
                        }
                    >
                        ⚙️
                    </Text>
                    <Text
                        style={
                            activeScreen === "Settings"
                                ? styles.navLabelActive
                                : styles.navLabel
                        }
                    >
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar Menu Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackground}
                        activeOpacity={1}
                        onPress={() => setMenuVisible(false)}
                    />
                    <View style={styles.sidebar}>
                        <View style={styles.sidebarHeader}>
                            <Text style={styles.sidebarTitle}>Leadsharing</Text>
                            <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.menuList}>
                            <MenuItem
                                icon="🏠"
                                label="Dashboard"
                                active={activeScreen === "Dashboard"}
                                onPress={() => handleMenuPress("Dashboard")}
                            />
                            <MenuItem
                                icon="👥"
                                label="Users"
                                active={activeScreen === "Users"}
                                onPress={() => handleMenuPress("Users")}
                            />
                            <MenuItem
                                icon="📂"
                                label="Categories"
                                active={activeScreen === "Categories"}
                                onPress={() => handleMenuPress("Categories")}
                            />
                            <MenuItem
                                icon="📑"
                                label="Subcategories"
                                active={activeScreen === "Subcategories"}
                                onPress={() => handleMenuPress("Subcategories")}
                            />
                            <MenuItem
                                icon="🏗️"
                                label="Jobs"
                                active={activeScreen === "Jobs"}
                                onPress={() => handleMenuPress("Jobs")}
                            />
                            <MenuItem
                                icon="📋"
                                label="Leads"
                                active={activeScreen === "Leads"}
                                onPress={() => handleMenuPress("Leads")}
                            />
                            <MenuItem
                                icon="💰"
                                label="Revenue"
                                active={activeScreen === "Revenue"}
                                onPress={() => handleMenuPress("Revenue")}
                            />
                            {/* <MenuItem
                                icon="🔍"
                                label="SEO Management"
                                active={activeScreen === "SEO Management"}
                                onPress={() => handleMenuPress("SEO Management")}
                            /> */}
                            <MenuItem
                                icon="⚙️"
                                label="Settings"
                                active={activeScreen === "Settings"}
                                onPress={() => handleMenuPress("Settings")}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={() => handleMenuPress("Sign Out")}
                        >
                            <Text style={styles.signOutIcon}>🚪</Text>
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function MenuItem({ icon, label, active, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.menuItem, active && styles.menuItemActive]}
            onPress={onPress}
        >
            <Text style={styles.menuIcon2}>{icon}</Text>
            <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    menuIcon: {
        width: 24,
        height: 24,
        justifyContent: "space-around",
    },
    menuLine: {
        width: 24,
        height: 3,
        backgroundColor: "#1E293B",
        borderRadius: 2,
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    notificationBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 20,
    },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'android' ? 20 : 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 4,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 4,
        opacity: 0.5,
    },
    navIconActive: {
        fontSize: 24,
        marginBottom: 4,
    },
    navLabel: {
        fontSize: 11,
        color: "#64748B",
    },
    navLabelActive: {
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        flexDirection: "row",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sidebar: {
        width: 280,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sidebarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2563EB",
    },
    closeButton: {
        fontSize: 24,
        color: "#64748B",
        fontWeight: "300",
    },
    menuList: {
        flex: 1,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginHorizontal: 12,
        borderRadius: 8,
    },
    menuItemActive: {
        backgroundColor: "#EFF6FF",
    },
    menuIcon2: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: "center",
    },
    menuLabel: {
        fontSize: 15,
        color: "#475569",
        fontWeight: "500",
    },
    menuLabelActive: {
        color: "#2563EB",
        fontWeight: "600",
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: 12,
        marginBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    signOutIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: "center",
    },
    signOutText: {
        fontSize: 15,
        color: "#EF4444",
        fontWeight: "600",
    },
    centerButton: {
        position: "relative",
        top: -20,
        alignItems: "center",
        justifyContent: "center",
        width: 64,
    },
    centerButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 4,
        borderColor: "#FFFFFF",
    },
    centerButtonIcon: {
        fontSize: 28,
        color: "#FFFFFF",
        fontWeight: "300",
        lineHeight: 28,
    },
});
