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
    Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "../LogoutModal";
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiCall } from "../../services/api";
import { NotificationService } from "../../services/NotificationService";

import { useNavigation } from "@react-navigation/native";

export default function AdminLayout({
    children,
    activeScreen,
    onScreenChange,
    refreshControl,
    onCreatePress,
    showBottomNav = true,
    onBack,
}) {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        setupNotifications();
        fetchUnreadCount();

        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    async function setupNotifications() {
        try {
            await NotificationService.registerForPushNotificationsAsync();
            await NotificationService.syncTokenWithBackend();
        } catch (error) {
            console.error("Error setting up push notifications:", error);
        }
    }

    async function fetchUnreadCount() {
        try {
            const response = await apiCall('/api/notifications');
            if (response.success) {
                setUnreadCount(response.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }

    function handleMenuPress(screen) {
        setMenuVisible(false);

        if (screen === "Sign Out") {
            handleLogout();
            return;
        }

        const tabScreens = ["Dashboard", "Users", "Jobs", "Verifications", "Profile", "DeletionRequests"];
        if (tabScreens.includes(screen)) {
            const targetTab = screen === "Profile" ? "ProfileTab" : screen;
            navigation.navigate(targetTab);
        } else {
            onScreenChange(screen);
        }
    }

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
                {onBack ? (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={onBack}
                    >
                        <Feather name="arrow-left" size={24} color="#1E293B" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Feather name="menu" size={24} color="#1E293B" />
                    </TouchableOpacity>
                )}

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{activeScreen}</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('NotificationHistory');
                            // Optimize: clear badge immediately on press
                            setUnreadCount(0);
                        }}
                        style={styles.notificationIcon}
                    >
                        <View>
                            <Feather name="bell" size={24} color={unreadCount > 0 ? "#2563EB" : "#1E293B"} />
                            {unreadCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
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
            {showBottomNav && (
                <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => handleMenuPress("Dashboard")}
                    >
                        <Feather
                            name="grid"
                            size={22}
                            color={activeScreen === "Dashboard" ? "#2563EB" : "#94A3B8"}
                        />
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
                        <Feather
                            name="users"
                            size={22}
                            color={activeScreen === "Users" ? "#2563EB" : "#94A3B8"}
                        />
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
                                <Feather name="plus" size={28} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => handleMenuPress("Jobs")}
                    >
                        <Feather
                            name="briefcase"
                            size={22}
                            color={activeScreen === "Jobs" ? "#2563EB" : "#94A3B8"}
                        />
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
                        onPress={() => handleMenuPress("Verifications")}
                    >
                        <Feather
                            name="shield"
                            size={22}
                            color={activeScreen === "Verifications" ? "#2563EB" : "#94A3B8"}
                        />
                        <Text
                            style={
                                activeScreen === "Verifications"
                                    ? styles.navLabelActive
                                    : styles.navLabel
                            }
                        >
                            Approvals
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => handleMenuPress("Profile")}
                    >
                        <Feather
                            name="user"
                            size={22}
                            color={activeScreen === "Profile" ? "#2563EB" : "#94A3B8"}
                        />
                        <Text
                            style={
                                activeScreen === "Profile"
                                    ? styles.navLabelActive
                                    : styles.navLabel
                            }
                        >
                            Profile
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Floating Action Button (for Tabs) */}
            {!showBottomNav && onCreatePress && (
                <TouchableOpacity
                    style={[styles.fab, { bottom: Math.max(insets.bottom, 20) + 70 }]}
                    onPress={onCreatePress}
                    activeOpacity={0.8}
                >
                    <Feather name="plus" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {/* Sidebar Menu Modal */}
            <Modal
                animationType="fade"
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
                            <Image
                                source={require("../../../assets/allcarepros-logo.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                <Feather name="x" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.menuList}>
                            <MenuItem
                                icon="grid"
                                label="Dashboard"
                                active={activeScreen === "Dashboard"}
                                onPress={() => handleMenuPress("Dashboard")}
                            />
                            <MenuItem
                                icon="users"
                                label="Users"
                                active={activeScreen === "Users"}
                                onPress={() => handleMenuPress("Users")}
                            />
                            <MenuItem
                                icon="layers"
                                label="Categories"
                                active={activeScreen === "Categories"}
                                onPress={() => handleMenuPress("Categories")}
                            />
                            <MenuItem
                                icon="list"
                                label="Subcategories"
                                active={activeScreen === "Subcategories"}
                                onPress={() => handleMenuPress("Subcategories")}
                            />
                            <MenuItem
                                icon="briefcase"
                                label="Jobs"
                                active={activeScreen === "Jobs"}
                                onPress={() => handleMenuPress("Jobs")}
                            />
                            <MenuItem
                                icon="shield"
                                label="Verifications"
                                labelText="Approvals"
                                active={activeScreen === "Verifications"}
                                onPress={() => handleMenuPress("Verifications")}
                            />
                            <MenuItem
                                icon="file-text"
                                label="Leads"
                                active={activeScreen === "Leads"}
                                onPress={() => handleMenuPress("Leads")}
                            />
                            <MenuItem
                                icon="dollar-sign"
                                label="Revenue"
                                active={activeScreen === "Revenue"}
                                onPress={() => handleMenuPress("Revenue")}
                            />
                            <MenuItem
                                icon="trash-2"
                                label="Deletion Requests"
                                active={activeScreen === "DeletionRequests"}
                                onPress={() => handleMenuPress("DeletionRequests")}
                            />
                            <MenuItem
                                icon="user"
                                label="Profile"
                                active={activeScreen === "Profile"}
                                onPress={() => handleMenuPress("Profile")}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={() => handleMenuPress("Sign Out")}
                        >
                            <Feather name="log-out" size={20} color="#EF4444" style={styles.signOutIconStyle} />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onLogout={confirmLogout}
            />
        </View >
    );
}

function MenuItem({ icon, label, active, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.menuItem, active && styles.menuItemActive]}
            onPress={onPress}
        >
            <Feather
                name={icon}
                size={20}
                color={active ? "#2563EB" : "#475569"}
                style={styles.menuIcon2}
            />
            <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        paddingHorizontal: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#1753ecff",
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
        paddingTop: 8,
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
    navLabel: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 4,
    },
    navLabelActive: {
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "600",
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        flexDirection: "row",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    logo: {
        width: 140,
        height: 60,
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
        marginBottom: 24,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    signOutIconStyle: {
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
        top: -24,
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
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 999,
    },
});

