import React, { useState } from "react";
import { Text, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeownerHomeTab from "../screens/homeowner/HomeownerHomeTab";
import HomeownerJobsTab from "../screens/homeowner/HomeownerJobsTab";
import HomeownerProfileTab from "../screens/homeowner/HomeownerProfileTab";
import PostJobScreen from "../screens/homeowner/PostJobScreen";
import JobDetailsScreen from "../screens/homeowner/JobDetailsScreen";
import EditProfileScreen from "../screens/homeowner/EditProfileScreen";
import MessagesModal from "../screens/MessagesModal";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Home tab
function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={HomeownerHomeTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PostJob"
                component={PostJobScreen}
                options={{ title: "Post a Job" }}
            />
            <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
                options={{ title: "Job Details" }}
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
                options={{ title: "Edit Profile" }}
            />
        </Stack.Navigator>
    );
}

export default function HomeownerTabs() {
    const [messagesVisible, setMessagesVisible] = useState(false);

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: "#2563EB",
                    tabBarInactiveTintColor: "#9CA3AF",
                    tabBarStyle: styles.tabBar,
                    tabBarLabelStyle: styles.tabLabel,
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeStack}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                                🏠
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Jobs"
                    component={JobsStack}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                                📋
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Messages"
                    component={EmptyComponent}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            setMessagesVisible(true);
                        },
                    }}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                                💬
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileStack}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                                👤
                            </Text>
                        ),
                    }}
                />
            </Tab.Navigator>

            <MessagesModal
                visible={messagesVisible}
                onClose={() => setMessagesVisible(false)}
            />
        </>
    );
}

// Empty component for Messages tab (since we use modal)
function EmptyComponent() {
    return null;
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === "ios" ? 85 : 80, // Increased for Android
        paddingBottom: Platform.OS === "ios" ? 28 : 20, // Increased for Android system buttons
        paddingTop: 8,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: -4,
    },
    tabIcon: {
        fontSize: 24,
    },
    tabIconActive: {
        transform: [{ scale: 1.1 }],
    },
});
