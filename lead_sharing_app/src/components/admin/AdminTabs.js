import React from "react";
import { StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdminDashboard from "../../screens/AdminDashboard";
import { normalize } from "../../utils/responsive";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#94A3B8",
                tabBarStyle: {
                    ...styles.tabBar,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={AdminDashboard}
                initialParams={{ screen: "Dashboard" }}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="grid" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Users"
                component={AdminDashboard}
                initialParams={{ screen: "Users" }}
                options={{
                    tabBarLabel: "Users",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="users" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={AdminDashboard}
                initialParams={{ screen: "Jobs" }}
                options={{
                    tabBarLabel: "Jobs",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="briefcase" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Verifications"
                component={AdminDashboard}
                initialParams={{ screen: "Verifications" }}
                options={{
                    tabBarLabel: "Approvals",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="shield" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="DeletionRequests"
                component={AdminDashboard}
                initialParams={{ screen: "DeletionRequests" }}
                options={{
                    tabBarLabel: "Deletion",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="trash-2" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={AdminDashboard}
                initialParams={{ screen: "Profile" }}
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        paddingTop: 10,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tabBarLabel: {
        fontSize: normalize(10),
        fontWeight: "600",
        marginBottom: 4,
    },
});
