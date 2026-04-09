import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function GeneralSettingsScreen({ onBack }) {
    const [appName, setAppName] = useState("AllCarePros App");
    const [supportEmail, setSupportEmail] = useState("support@example.com");
    const [websiteUrl, setWebsiteUrl] = useState("https://example.com");

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={normalize(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>General Settings</Text>
            </View> */}

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Application Name</Text>
                    <TextInput
                        style={styles.input}
                        value={appName}
                        onChangeText={setAppName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Support Email</Text>
                    <TextInput
                        style={styles.input}
                        value={supportEmail}
                        onChangeText={setSupportEmail}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Website URL</Text>
                    <TextInput
                        style={styles.input}
                        value={websiteUrl}
                        onChangeText={setWebsiteUrl}
                        keyboardType="url"
                    />
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>App Version: 1.0.0</Text>
                    <Text style={styles.infoText}>Build Number: 20240214</Text>
                </View>
            </ScrollView>
        </View>
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
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        marginRight: wp(3),
        padding: wp(1),
    },
    headerTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
    },
    content: {
        padding: wp(5),
    },
    inputGroup: {
        marginBottom: hp(2.5),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#475569",
        marginBottom: hp(1),
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        padding: wp(4),
        fontSize: normalize(15),
        color: "#1E293B",
    },
    saveButton: {
        backgroundColor: "#2563EB",
        borderRadius: wp(3),
        paddingVertical: hp(2),
        alignItems: "center",
        marginTop: hp(2),
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontWeight: "700",
    },
    infoSection: {
        marginTop: hp(5),
        alignItems: "center",
    },
    infoText: {
        color: "#94A3B8",
        fontSize: normalize(12),
        marginBottom: hp(0.5),
    },
});
