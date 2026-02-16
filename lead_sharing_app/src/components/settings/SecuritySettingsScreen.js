import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function SecuritySettingsScreen({ onBack }) {
    const [twoFactor, setTwoFactor] = useState(false);
    const [biometric, setBiometric] = useState(true);

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={normalize(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
            </View> */}

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Login Security</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                            <Text style={styles.settingDescription}>Require code via email/SMS</Text>
                        </View>
                        <Switch
                            value={twoFactor}
                            onValueChange={setTwoFactor}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={twoFactor ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Biometric Login</Text>
                            <Text style={styles.settingDescription}>Unlock with FaceID/TouchID</Text>
                        </View>
                        <Switch
                            value={biometric}
                            onValueChange={setBiometric}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={biometric ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Change Password</Text>

                    <TouchableOpacity style={styles.changePasswordButton}>
                        <Feather name="lock" size={normalize(20)} color="#2563EB" style={styles.buttonIcon} />
                        <Text style={styles.changePasswordText}>Update Password</Text>
                        <Feather name="chevron-right" size={normalize(20)} color="#2563EB" style={{ marginLeft: "auto" }} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sessions</Text>
                    <TouchableOpacity style={[styles.changePasswordButton, { borderColor: "#FECACA", backgroundColor: "#FEF2F2" }]}>
                        <Feather name="log-out" size={normalize(20)} color="#EF4444" style={styles.buttonIcon} />
                        <Text style={[styles.changePasswordText, { color: "#EF4444" }]}>Log Out All Sessions</Text>
                    </TouchableOpacity>
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
        padding: wp(4),
    },
    section: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#64748B",
        marginBottom: hp(1.5),
        textTransform: "uppercase",
        marginLeft: wp(1),
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    settingText: {
        flex: 1,
        marginRight: wp(4),
    },
    settingLabel: {
        fontSize: normalize(16),
        color: "#1E293B",
        fontWeight: "500",
    },
    settingDescription: {
        fontSize: normalize(13),
        color: "#64748B",
        marginTop: hp(0.5),
    },
    changePasswordButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    buttonIcon: {
        marginRight: wp(3),
    },
    changePasswordText: {
        fontSize: normalize(15),
        color: "#2563EB",
        fontWeight: "600",
    },
});
