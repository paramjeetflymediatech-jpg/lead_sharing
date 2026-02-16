import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function SettingsScreen({ onNavigate }) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.screenTitle}>Platform Settings</Text>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={() => onNavigate("NotificationSettings")}
            >
                <Feather name="bell" size={normalize(24)} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingSubtitle}>Manage notification preferences</Text>
                </View>
                <Feather name="chevron-right" size={normalize(20)} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={() => onNavigate("GeneralSettings")}
            >
                <Feather name="globe" size={normalize(24)} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>General Settings</Text>
                    <Text style={styles.settingSubtitle}>Platform configuration</Text>
                </View>
                <Feather name="chevron-right" size={normalize(20)} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={() => onNavigate("SecuritySettings")}
            >
                <Feather name="lock" size={normalize(24)} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Security</Text>
                    <Text style={styles.settingSubtitle}>Privacy and security settings</Text>
                </View>
                <Feather name="chevron-right" size={normalize(20)} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingItem}
                onPress={() => onNavigate("PaymentSettings")}
            >
                <Feather name="credit-card" size={normalize(24)} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Payment Settings</Text>
                    <Text style={styles.settingSubtitle}>Configure payment options</Text>
                </View>
                <Feather name="chevron-right" size={normalize(20)} color="#94A3B8" />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: hp(4),
    },
    screenTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2.5),
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingIconStyle: {
        marginRight: wp(4),
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    settingSubtitle: {
        fontSize: normalize(13),
        color: "#64748B",
    },
});
