import React from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TradespersonHomeTab from "../screens/tradesperson/TradespersonHomeTab";
import TradespersonBrowseTab from "../screens/tradesperson/TradespersonBrowseTab";
import TradespersonProfileTab from "../screens/tradesperson/TradespersonProfileTab";
import JobDetailsScreen from "../screens/tradesperson/JobDetailsScreen";
import MyLeadsScreen from "../screens/tradesperson/MyLeadsScreen";
import EditProfileScreen from "../screens/tradesperson/EditProfileScreen";
import BuyCreditsScreen from "../screens/tradesperson/BuyCreditsScreen";
import MessagesListScreen from "../screens/MessagesListScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Home tab
function HomeStack({ navigation }) {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={TradespersonHomeTab}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
                options={{ title: "Job Details" }}
            />
            <Stack.Screen
                name="BuyCredits"
                component={BuyCreditsScreen}
                options={{ title: "Buy Credits" }}
            />
        </Stack.Navigator>
    );
}

// Stack for Browse tab
function BrowseStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="BrowseMain"
                component={TradespersonBrowseTab}
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
                component={TradespersonProfileTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: "Edit Profile" }}
            />
            <Stack.Screen
                name="MyLeads"
                component={MyLeadsScreen}
                options={{ title: "My Leads" }}
            />
            <Stack.Screen
                name="BuyCredits"
                component={BuyCreditsScreen}
                options={{ title: "Buy Credits" }}
            />
        </Stack.Navigator>
    );
}

export default function TradespersonTabs() {
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
                name="Browse"
                component={BrowseStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} />
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
