import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function NotificationSettingsScreen({ onBack }) {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [newHomeownerAlert, setNewHomeownerAlert] = useState(true);
    const [newTradespersonAlert, setNewTradespersonAlert] = useState(true);
    const [newJobAlert, setNewJobAlert] = useState(true);
    const [newLeadAlert, setNewLeadAlert] = useState(true);

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={normalize(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View> */}

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Permissions</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Push Notifications</Text>
                            <Text style={styles.settingDescription}>Receive alerts on this device</Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={pushEnabled ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Email Notifications</Text>
                            <Text style={styles.settingDescription}>Receive digests and alerts via email</Text>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={emailEnabled ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>
                </View>

                {pushEnabled && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Alert Preferences</Text>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>New Homeowner Signups</Text>
                            <Switch
                                value={newHomeownerAlert}
                                onValueChange={setNewHomeownerAlert}
                                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                                thumbColor={newHomeownerAlert ? "#2563EB" : "#F1F5F9"}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>New Tradesperson Signups</Text>
                            <Switch
                                value={newTradespersonAlert}
                                onValueChange={setNewTradespersonAlert}
                                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                                thumbColor={newTradespersonAlert ? "#2563EB" : "#F1F5F9"}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>New Job Posts</Text>
                            <Switch
                                value={newJobAlert}
                                onValueChange={setNewJobAlert}
                                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                                thumbColor={newJobAlert ? "#2563EB" : "#F1F5F9"}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>New Leads Generated</Text>
                            <Switch
                                value={newLeadAlert}
                                onValueChange={setNewLeadAlert}
                                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                                thumbColor={newLeadAlert ? "#2563EB" : "#F1F5F9"}
                            />
                        </View>
                    </View>
                )}
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
});
