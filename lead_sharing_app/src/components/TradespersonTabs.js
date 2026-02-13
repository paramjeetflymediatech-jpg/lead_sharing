import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from '@expo/vector-icons';
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
function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={TradespersonHomeTab}
                options={{ headerShown: false }}
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
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: styles.tabBar,
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Feather name="home" size={24} color={focused ? "#FFFFFF" : color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Browse"
                component={BrowseStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Feather name="search" size={24} color={focused ? "#FFFFFF" : color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesListScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Feather name="message-square" size={24} color={focused ? "#FFFFFF" : color} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Feather name="user" size={24} color={focused ? "#FFFFFF" : color} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 2,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        height: 60,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
        }),
        borderTopWidth: 0,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconContainer: {
        backgroundColor: '#2563EB',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
