import React from "react";
import { StyleSheet, Platform, View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeownerHomeTab from "../screens/homeowner/HomeownerHomeTab";
import HomeownerJobsTab from "../screens/homeowner/HomeownerJobsTab";
import HomeownerProfileTab from "../screens/homeowner/HomeownerProfileTab";
import PostJobScreen from "../screens/homeowner/PostJobScreen";
import JobDetailsScreen from "../screens/homeowner/JobDetailsScreen";
import EditProfileScreen from "../screens/homeowner/EditProfileScreen";
import MessagesListScreen from "../screens/MessagesListScreen";
import NotificationsScreen from "../screens/homeowner/NotificationsScreen";
import PrivacySecurityScreen from "../screens/homeowner/PrivacySecurityScreen";
import HelpCenterScreen from "../screens/homeowner/HelpCenterScreen";
import ContactUsScreen from "../screens/homeowner/ContactUsScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import DeleteAccountRequestScreen from "../screens/DeleteAccountRequestScreen";
import TermsAndConditionsScreen from "../screens/TermsAndConditionsScreen";
import TradespersonProfileScreen from "../screens/tradesperson/TradespersonProfileScreen";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Home tab
function HomeStack({ navigation }) {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={HomeownerHomeTab}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="PostJob"
                component={PostJobScreen}
                options={{ title: "Post a Job", headerShown: false }}
            />
            <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
                options={{ title: "Job Details" }}
            />
            <Stack.Screen
                name="TradespersonProfile"
                component={TradespersonProfileScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

// Stack for Jobs tab
function JobsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="JobsMain"
                component={HomeownerJobsTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
                options={{ title: "Job Details" }}
            />
        </Stack.Navigator>
    );
}

// Stack for Profile tab
function ProfileStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProfileMain"
                component={HomeownerProfileTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: "Edit Profile", headerShown: false }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PrivacySecurity"
                component={PrivacySecurityScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="HelpCenter"
                component={HelpCenterScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ContactUs"
                component={ContactUsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TermsAndConditions"
                component={TermsAndConditionsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DeleteAccountRequest"
                component={DeleteAccountRequestScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default function HomeownerTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: {
                    ...styles.tabBar,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={JobsStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="list" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="message-square" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
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
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});
